<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Payment;
use App\Models\Purchase;
use App\Jobs\DeliverPurchase;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;

#[ApiResource(
    paginationItemsPerPage: 20,
    rules: \App\Http\Requests\BoutiqueUpsertRequest::class,
    middleware: ['auth:sanctum'],
    operations: [
        new GetCollection(middleware: ['permission:boutiques.read']),
        new Get(),
        new Post(middleware: ['permission:boutiques.create']),
        new Patch(middleware: ['permission:boutiques.update']),
        new Delete(middleware: ['permission:boutiques.delete']),
    ],
)]
class Boutique extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'type',
        'price_cfa',
        'description',
        'files',
        'is_active',
        'image_path',
        'category',
        'category_id',
        'categoryId',
        'downloads_count',
        'rating',
    ];

    protected $casts = [
        'price_cfa'       => 'integer',
        'is_active'       => 'boolean',
        'files'           => 'array',
        'downloads_count' => 'integer',
        'rating'          => 'decimal:1',
    ];

    protected $appends = ['image_url', 'files_urls'];

    protected static function booted()
    {
        static::creating(function (self $b) {
            if (empty($b->code)) {
                $next = (int) (self::max('id') ?? 0) + 1;
                $b->code = 'PROD' . str_pad((string)$next, 3, '0', STR_PAD_LEFT);
            }
            if (empty($b->type)) {
                $b->type = 'service';
            }
        });

        static::saving(function (self $b) {
            // Normaliser category_id depuis plusieurs formats
            if (empty($b->category_id)) {
                $cands = [];
                foreach (['category_id', 'categoryId', 'category'] as $k) {
                    if (!is_null($b->getAttribute($k))) $cands[] = $b->getAttribute($k);
                }
                $req = request();
                if ($req) {
                    foreach (['category_id', 'categoryId', 'category'] as $k) {
                        if ($req->has($k)) $cands[] = $req->input($k);
                    }
                }
                foreach ($cands as $val) {
                    if (is_string($val) && preg_match('/\/(\d+)(\?.*)?$/', $val, $m)) {
                        $b->category_id = (int)$m[1];
                        break;
                    }
                    if (is_array($val) && isset($val['@id']) && preg_match('/\/(\d+)(\?.*)?$/', $val['@id'], $m)) {
                        $b->category_id = (int)$m[1];
                        break;
                    }
                    if (is_array($val) && isset($val['id'])) {
                        $b->category_id = (int)$val['id'];
                        break;
                    }
                    if (is_numeric($val)) {
                        $b->category_id = (int)$val;
                        break;
                    }
                }
            }

            $file = request()->file('image') ?? request()->file('file');
            if ($file) {
                if ($b->getOriginal('image_path')) {
                    Storage::disk('public')->delete($b->getOriginal('image_path'));
                }
                $b->image_path = $file->store('boutique/images', 'public');
            }
            if (request()->filled('image_url')) {
                $b->image_path = request('image_url');
            }

            // Fichiers multiples si type = file
            if (($b->type ?? 'service') === 'file') {
                $existing = is_array($b->files) ? $b->files : [];

                // ajout via upload multipart
                if (request()->hasFile('files')) {
                    foreach ((array) request()->file('files') as $uploaded) {
                        $path = $uploaded->store('boutique/files', 'public');
                        $existing[] = $path;
                    }
                }

                // ajout via payload JSON déjà stocké (ex: cron, import)
                if (request()->filled('files_json') && is_array(request('files_json'))) {
                    foreach (request('files_json') as $p) {
                        if (is_string($p) && strlen($p)) $existing[] = $p;
                    }
                }

                // dédup + réindex
                $b->files = array_values(array_unique($existing));
            } else {
                // 
                //
            }
        });

        static::deleting(function (self $b) {
            if ($b->image_path && !preg_match('#^https?://#i', $b->image_path)) {
                Storage::disk('public')->delete($b->image_path);
            }
            if (is_array($b->files)) {
                foreach ($b->files as $p) {
                    if ($p && !preg_match('#^https?://#i', $p)) {
                        Storage::disk('public')->delete($p);
                    }
                }
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        if ($this->image_path) {
            if (preg_match('#^https?://#i', $this->image_path)) return $this->image_path;
            return asset('storage/' . ltrim($this->image_path, '/'));
        }
        return null;
    }

    public function getFilesUrlsAttribute(): array
    {
        if (!is_array($this->files)) return [];
        return array_map(function ($p) {
            if (preg_match('#^https?://#i', $p)) return $p;
            return asset('storage/' . ltrim($p, '/'));
        }, $this->files);
    }

    public function payableAmountXof(): int
    {
        return (int) ($this->price_cfa ?? 0);
    }

    public function payableLabel(): string
    {
        return trim(($this->name ?? 'Produit') . ' • ' . ($this->code ?? ''));
    }

    public function onPaymentSucceeded(Payment $payment): void
    {
        $user = null;

        if (!empty($payment->meta['user_id'])) {
            $user = \App\Models\User::find($payment->meta['user_id']);
        }
        if (!$user && $payment->customer_email) {
            $user = \App\Models\User::where('email', $payment->customer_email)->first();
        }
        if (!$user) {
            $user = \App\Models\User::create([
                'name'     => trim(($payment->customer_first_name ?: 'Client') . ' ' . ($payment->customer_last_name ?: '')),
                'email'    => $payment->customer_email,
                'phone'    => $payment->customer_phone,
                'password' => \Illuminate\Support\Facades\Hash::make(Str::random(24)),
            ]);
            if (method_exists($user, 'assignRole')) {
                try {
                    $user->assignRole('Client');
                } catch (\Throwable $e) {
                }
            }
        }

        $purchase = Purchase::create([
            'ref'              => Purchase::nextRef(),
            'user_id'          => $user->id,
            'boutique_id'      => $this->id,
            'status'           => 'paid',
            'unit_price_cfa'   => (int) $payment->amount,
            'currency'         => $payment->currency ?: 'XOF',
            'channel'          => $payment->channel,
            'customer_snapshot' => [
                'firstName' => $payment->customer_first_name,
                'lastName'  => $payment->customer_last_name,
                'email'     => $payment->customer_email,
                'phone'     => $payment->customer_phone,
            ],
            'product_snapshot' => [
                'name'        => $this->name,
                'code'        => $this->code,
                'type'        => $this->type,
                'description' => $this->description,
                'files'       => is_array($this->files) ? $this->files : [],
                'files_urls'  => $this->files_urls ?? [],
                'image_url'   => $this->image_url,
            ],
            'meta' => ['payment_ref' => $payment->reference],
        ]);

        \App\Jobs\DeliverPurchase::dispatchSync($purchase->id);
    }
}
