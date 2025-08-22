<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Casts\Attribute;

// API Platform
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\QueryParameter;
use ApiPlatform\Laravel\Eloquent\Filter\PartialSearchFilter;
use ApiPlatform\Laravel\Eloquent\Filter\OrderFilter;

#[ApiResource(
    paginationItemsPerPage: 20,
    middleware: ['auth:sanctum'],
    operations: [
        new GetCollection(middleware: ['permission:users.read']),
        new Get(middleware: ['permission:users.read']),
        new Post(middleware: ['permission:users.create']),
        new Patch(middleware: ['permission:users.update']),
        new Delete(middleware: ['permission:users.delete']),
    ],
)]
#[QueryParameter(key: ':property', filter: PartialSearchFilter::class)]
#[QueryParameter(key: 'sort[:property]', filter: OrderFilter::class)]

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $guard_name = 'web';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'address',
        'status',
        'services_count',
        'last_activity_at',
        'code',
        'profession',
        'nationality'
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_activity_at'  => 'datetime',
        'services_count'    => 'integer',
        'password'          => 'hashed',
    ];

    /**
     * Normalise phone: trim, "" => null
     */
    protected function phone(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                if (is_string($value)) {
                    $value = trim($value);
                }
                return $value === '' ? null : $value;
            }
        );
    }

    /**
     * Normalise address: trim, "" => null
     */
    protected function address(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                if (is_string($value)) {
                    $value = trim($value);
                }
                return $value === '' ? null : $value;
            }
        );
    }

    protected static function booted()
    {
        static::creating(function (User $u) {
            if (empty($u->code)) {
                $next = (int) (self::max('id') ?? 0) + 1;
                $u->code = 'CLI' . str_pad((string) $next, 3, '0', STR_PAD_LEFT);
            }
            if (empty($u->status)) {
                $u->status = 'Actif';
            }
        });

        static::saving(function (User $u) {
            if (! $u->exists && empty($u->password)) {
                $u->password = request()->input('password') ?? Str::random(16);
            }
        });

        static::created(function (User $user) {
            if (! $user->roles()->exists()) {
                $user->syncRoles('Client');
            }
        });
    }
}
