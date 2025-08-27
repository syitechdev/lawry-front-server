<?php

namespace App\Services;

class PaiementProSigner
{
    public function compute(array $payload): string
    {
        $secret = (string) config('services.paiementpro.secret', '');
        if ($secret === '') {
            throw new \RuntimeException('PaiementPro secret manquant (PMP_SECRET).');
        }
        unset($payload['hashcode']);

        ksort($payload);
        $base = http_build_query($payload, '', '&', PHP_QUERY_RFC3986);

        return hash_hmac('sha256', $base, $secret);
    }

    public function verify(array $payload): bool
    {
        $received = (string) ($payload['hashcode'] ?? '');
        $expected = $this->compute($payload);
        return $received !== '' && hash_equals($expected, $received);
    }
}
