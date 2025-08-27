<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Schema;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;

use App\Contracts\PayableContract;
use App\Traits\IsPayable;
use App\Models\Payment;
use App\Models\User;
use App\Models\RegistrationItem;

#[ApiResource(
    paginationItemsPerPage: 20,
    rules: \App\Http\Requests\FormationUpsertRequest::class,
    operations: [
        new GetCollection(),
        new Get(),
        new Post(middleware: ['auth:sanctum', 'permission:formations.create']),
        new Patch(middleware: ['auth:sanctum', 'permission:formations.update']),
        new Delete(middleware: ['auth:sanctum', 'permission:formations.delete']),
    ],
)]
class Formation extends Model implements PayableContract
{
    use HasFactory, IsPayable;

    protected $fillable = [
        'title',
        'code',
        'description',
        'price_cfa',
        'price_type',
        'duration',
        'max_participants',
        'type',
        'level',
        'date',
        'trainer',
        'active',
        'modules',
        'category_id',
    ];

    protected $casts = [
        'active'           => 'boolean',
        'price_cfa'        => 'integer',
        'max_participants' => 'integer',
        'date'             => 'date:Y-m-d',
        'modules'          => 'array',
    ];

    protected static function booted()
    {
        static::creating(function (Formation $f) {
            if (empty($f->code)) {
                $next = (int) (Formation::max('id') ?? 0) + 1;
                $f->code = 'FORM' . str_pad((string) $next, 3, '0', STR_PAD_LEFT);
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function registrationItems()
    {
        return $this->hasMany(RegistrationItem::class);
    }

    public function categoryId(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->attributes['category_id'] ?? null,
            set: fn($value) => ['category_id' => (int) $value],
        );
    }

    public function payableAmountXof(): int
    {
        return (int) $this->price_cfa;
    }

    public function payableLabel(): string
    {
        $title = $this->title ?: ('#' . $this->getKey());
        $code  = $this->code ? " ({$this->code})" : '';
        return 'Formation: ' . $title . $code;
    }

    public function onPaymentSucceeded(Payment $payment): void
    {
        $userId = (int) data_get($payment->meta, 'user_id');
        if (!$userId && $payment->customer_email) {
            $userId = optional(User::where('email', $payment->customer_email)->first())->id;
        }
        if (!$userId) {
            $payment->meta = array_merge($payment->meta ?? [], ['registration_warning' => 'user_not_found']);
            $payment->save();
            return;
        }

        $item = RegistrationItem::firstOrNew([
            'formation_id' => $this->getKey(),
            'user_id'      => $userId,
        ]);

        $fill = [];
        if (Schema::hasColumn($item->getTable(), 'status'))    $fill['status'] = 'paid';
        if (Schema::hasColumn($item->getTable(), 'paid_at'))   $fill['paid_at'] = now();

        $amount = (int) $payment->amount;
        if (Schema::hasColumn($item->getTable(), 'amount_cfa')) $fill['amount_cfa'] = $amount;
        elseif (Schema::hasColumn($item->getTable(), 'amount')) $fill['amount'] = $amount;

        if (Schema::hasColumn($item->getTable(), 'currency'))   $fill['currency'] = $payment->currency ?: 'XOF';
        if (Schema::hasColumn($item->getTable(), 'payment_id')) $fill['payment_id'] = $payment->id;

        if (Schema::hasColumn($item->getTable(), 'meta')) {
            $meta = $item->meta ?? [];
            $meta['payment_reference'] = $payment->reference;
            $meta['channel'] = $payment->channel;
            $fill['meta'] = $meta;
        }

        if (!empty($fill)) $item->fill($fill);
        $item->save();

        $payment->meta = array_merge($payment->meta ?? [], ['registration_item_id' => $item->id]);
        $payment->save();
    }
}
