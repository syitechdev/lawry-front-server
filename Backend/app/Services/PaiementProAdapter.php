<?php

namespace App\Services;

use SoapClient;

class PaiementProAdapter
{
    public function initTransact(object|array $params): object
    {
        $client = new SoapClient(
            config('services.paiementpro.wsdl'),
            ['cache_wsdl' => WSDL_CACHE_NONE]
        );
        return $client->initTransact($params);
    }

    public function processingUrl(): string
    {
        return (string) config('services.paiementpro.processing_url');
    }

    public function currencyCode(): string
    {
        return (string) config('services.paiementpro.currency_code', '952');
    }
}
