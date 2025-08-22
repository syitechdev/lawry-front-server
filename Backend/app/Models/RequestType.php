<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestType extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'version',
        'is_active',
        'pricing_mode',
        'price_amount',
        'currency',
        'variants_csv',
        'features_csv',
        'config'
    ];

    protected $casts = ['is_active' => 'boolean', 'config' => 'array'];

    protected $appends = ['variants', 'features', 'price_display', 'locked'];

    public function scopeActive($q)
    {
        return $q->where('is_active', true);
    }

    public static function activeSlugs(): array
    {
        return static::active()->pluck('slug')->all();
    }


    public function demandes()
    {
        return $this->hasMany(Demande::class, 'type_slug', 'slug');
    }

    public function getVariantsAttribute(): array
    {
        return $this->csvToArray($this->variants_csv);
    }

    public function getFeaturesAttribute(): array
    {
        return $this->csvToArray($this->features_csv);
    }

    public function setVariantsAttribute($v): void
    {
        $this->variants_csv = $this->arrayToCsv($v);
    }

    public function setFeaturesAttribute($v): void
    {
        $this->features_csv = $this->arrayToCsv($v);
    }

    public function getPriceDisplayAttribute(): string
    {
        if ($this->pricing_mode === 'quote') return 'Sur devis';
        if (!$this->price_amount) return 'Sur devis';
        $amount = number_format($this->price_amount, 0, ',', ' ');
        return $this->pricing_mode === 'from'
            ? "À partir de {$amount} {$this->currency}"
            : "{$amount} {$this->currency}";
    }


    public function getLockedAttribute(): bool
    {
        if (isset($this->attributes['demandes_count'])) {
            return ((int) $this->attributes['demandes_count']) > 0;
        }
        return $this->demandes()->exists();
    }

    public function variantsAll(): array
    {
        $cards = (array) data_get($this->config, 'variant_cards', []);
        if (!empty($cards)) {
            return $cards;
        }
        return (array) data_get($this->config, 'variants', []);
    }


    public function variantsActive(): array
    {
        return collect($this->variantsAll())
            ->filter(fn($v) => data_get($v, 'active', true))
            ->sortBy(fn($v) => data_get($v, 'order', 999))
            ->values()
            ->all();
    }

    /**
     * Recherche d'une variante par 'key'
     * @param string $key
     * @param bool $onlyActive true = chercher uniquement parmi les variantes actives
     */
    public function findVariant(string $key, bool $onlyActive = true): ?array
    {
        $list = $onlyActive ? $this->variantsActive() : $this->variantsAll();
        foreach ($list as $v) {
            if ((string) data_get($v, 'key') === $key) {
                return $v;
            }
        }
        return null;
    }

    private function csvToArray(?string $csv): array
    {
        if (!$csv) return [];
        return collect(explode(',', $csv))
            ->map(fn($s) => trim($s))
            ->filter(fn($s) => $s !== '')
            ->values()
            ->all();
    }

    private function arrayToCsv($value): ?string
    {
        if (is_array($value)) {
            $clean = collect($value)->map(fn($s) => trim((string) $s))->filter()->implode(', ');
            return $clean === '' ? null : $clean;
        }
        return is_string($value) ? $value : null;
    }
}
