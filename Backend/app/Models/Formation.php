<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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
use App\Models\Registration;

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
        static::creating(function (self $f) {
            if (empty($f->code)) {
                $next = (int) (self::max('id') ?? 0) + 1;
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
        return $this->hasMany(Registration::class);
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

    protected function resolveUserForPayment(Payment $payment): User
    {
        $user = null;
        if (!empty($payment->meta['user_id'])) {
            $user = User::find((int) $payment->meta['user_id']);
        }
        if (!$user && $payment->customer_email) {
            $user = User::where('email', $payment->customer_email)->first();
        }
        if (!$user) {
            $user = User::create([
                'name'     => trim(($payment->customer_first_name ?: 'Client') . ' ' . ($payment->customer_last_name ?: '')),
                'email'    => $payment->customer_email,
                'phone'    => $payment->customer_phone,
                'password' => Hash::make(Str::random(24)),
            ]);
            if (method_exists($user, 'assignRole')) {
                try {
                    $user->assignRole('Client');
                } catch (\Throwable $e) {
                }
            }
        }
        return $user;
    }

    public function onPaymentPending(Payment $payment): void
    {
        $user = $this->resolveUserForPayment($payment);
        $registration = Registration::firstOrNew([
            'formation_id' => $this->getKey(),
            'user_id'      => $user->id,
        ]);
        $registration->fill([
            'status'     => 'paiement en attente',
            'price_type' => $this->price_type,
        ]);
        $registration->save();
        $payment->meta = array_merge($payment->meta ?? [], ['registration_id' => $registration->id]);
        $payment->save();
    }

    public function onPaymentSucceeded(Payment $payment): void
    {
        $user = $this->resolveUserForPayment($payment);
        $registration = Registration::firstOrNew([
            'formation_id' => $this->getKey(),
            'user_id'      => $user->id,
        ]);
        $registration->fill([
            'status'     => 'paiement confirmé',
            'amount_cfa' => (int) $payment->amount,
            'price_type' => $this->price_type,
        ]);
        $registration->save();
        $payment->meta = array_merge($payment->meta ?? [], ['registration_id' => $registration->id]);
        $payment->save();
    }

    public function onPaymentFailed(Payment $payment): void
    {
        $user = $this->resolveUserForPayment($payment);
        $registration = Registration::firstOrNew([
            'formation_id' => $this->getKey(),
            'user_id'      => $user->id,
        ]);
        $registration->fill([
            'status'     => 'paiement échoué',
            'price_type' => $this->price_type,
        ]);
        $registration->save();
        $payment->meta = array_merge($payment->meta ?? [], ['registration_id' => $registration->id]);
        $payment->save();
    }
}
