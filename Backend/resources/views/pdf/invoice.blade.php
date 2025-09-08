@php
/** $data attendu:
* company: { name, email, phone, logo_url }
* customer: { name, email, phone, avatar_url? }
* product: { type, title, details? (array|string) }
* totals: { subtotal, tax, total }
*/
$d = $data;
$label = trim($d['product']['title'] ?? '') !== '' ? $d['product']['title'] : 'Prestation';
$genAt = isset($generatedAt) ? \Illuminate\Support\Carbon::parse($generatedAt) : now();
$companyLogo = $d['company']['logo_url'] ?? config('app.company_logo_url');

@endphp
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="utf-8" />
    <title>Invoice #{{ $d['reference'] }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900&display=swap" rel="stylesheet" />
    <style>
        /* === remplace les règles existantes par celles-ci (section de base) === */
        * {
            margin: 0;
            box-sizing: border-box
        }

        /* IMPORTANT: pas de hauteur forcée qui crée une 2e page */
        html,
        body {}

        /* PDF full blanc */
        body {
            background: #fff;
            /* ← plus de gris */
            font-family: Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* tailles */
        h1 {
            font-size: 1.2em;
            color: #222;
            font-weight: 700;
        }

        /* ← titre réduit */
        h2 {
            font-size: .9em
        }

        h3 {
            font-size: 1.2em;
            font-weight: 300;
            line-height: 2em
        }

        p {
            font-size: .7em;
            color: #666;
            line-height: 1.2em
        }

        @page {
            size: A4;
            margin: 15mm;
        }

        @media print {
            body {
                background: #fff;
            }

            #invoice {
                top: 0 !important;
                box-shadow: none !important;
            }
        }

        #invoiceholder {
            width: 100%;
            height: auto;
            padding-top: 0;
        }

        #invoice {
            position: relative;
            margin: 0 auto;
            background: #FFF;
            max-width: 960px;
        }

        /* sections */
        [id*='invoice-'] {
            border-bottom: 1px solid #EEE;
            padding: 24px 30px;
        }

        #invoice-bot {
            min-height: auto;
        }

        .logo {
            float: left;
            height: 60px;
            width: 60px;
            background: #eee no-repeat center/contain;
            background-image: url('{{ $companyLogo }}');
        }



        .info {
            display: block;
            float: left;
            margin-left: 20px;
        }

        .title {
            float: right;
        }

        .title p {
            text-align: right;
        }

        .clearfix:after {
            content: "";
            display: block;
            clear: both;
        }

        /* Milieu */
        .clientlogo {
            float: left;
            height: 60px;
            width: 60px;
            background: #eee no-repeat center/cover;
            border-radius: 50px;
        }

        #project {
            margin-left: 52%;
        }

        /* Tableau */
        table {
            width: 100%;
            border-collapse: collapse;
        }

        td,
        th {
            padding: 5px 0 5px 15px;
            border: 1px solid #EEE;
        }

        .tabletitle {
            padding: 5px;
            background: #EEE;
        }

        .item {
            width: 50%;
        }

        .itemtext {
            font-size: .9em;
        }

        .right {
            text-align: right;
        }

        /* Pied */
        #legalcopy {
            margin-top: 24px;
        }

        .legal {
            width: 70%;
        }

        .effect2:before,
        .effect2:after {
            content: none !important;
            display: none !important;
        }
    </style>
</head>

<body>
    <div id="invoiceholder">
        <div id="invoice" class="no-print-shadow">

            <!-- Top -->
            <div id="invoice-top" class="clearfix">


                <div class="info">
                    <h1 style="color:rgb(185 28 28)">{{ $d['company']['name'] ?? '' }}</h1>
                    <p>
                        @if(!empty($d['company']['email'])) {{ $d['company']['email'] }}<br />@endif
                        @if(!empty($d['company']['phone'])) {{ $d['company']['phone'] }}@endif <br>
                        @if(!empty($d['company']['address'])) {{ $d['company']['address'] }}@endif
                    </p>
                </div>

                <div class="title">
                    <h2> #{{ $d['reference'] }}</h2>
                    <p>
                        Payé le : {{ \Illuminate\Support\Carbon::parse($d['date'] ?? now())->format('M d, Y') }}<br />
                        Géneré le : {{ $genAt->format('d.m.Y H:i') }}
                    </p>
                </div>
            </div>

            <!-- Mid -->
            <div id="invoice-mid" class="clearfix">
                <div class="info" style="margin-left:20px">
                    <h2>Client</h2>
                    <p>
                        {{ $d['customer']['name'] ?? '' }}<br />
                        @if(!empty($d['customer']['email'])) {{ $d['customer']['email'] }}<br />@endif
                        @if(!empty($d['customer']['phone'])) {{ $d['customer']['phone'] }}@endif
                    </p>
                </div>

                <div id="project">
                    <h2> Description</h2>
                    <p>
                        <strong>{{ ucfirst($d['product']['type'] ?? 'service') }}</strong> — {{ $label }}.
                        @if(!empty($d['product']['details']))
                        @php
                        $txt = is_array($d['product']['details'])
                        ? collect($d['product']['details'])->map(function($v,$k){
                        if (is_array($v) && count($v)) return ucfirst($k).': '.implode(', ',$v);
                        if (is_string($v) && trim($v)!=='') return ucfirst($k).': '.$v;
                        return null;
                        })->filter()->implode('. ')
                        : (string) $d['product']['details'];
                        @endphp
                        @if($txt) — {{ $txt }}.@endif
                        @endif
                    </p>
                </div>
            </div>

            <!-- Bottom -->
            <div id="invoice-bot">
                <div id="table">
                    <table>
                        <tr class="tabletitle">
                            <td class="item">
                                <h2>Item Description</h2>
                            </td>
                            <td class="Hours">
                                <h2>Qty</h2>
                            </td>
                            <td class="Rate">
                                <h2>Rate</h2>
                            </td>
                            <td class="subtotal">
                                <h2>Sub-total</h2>
                            </td>
                        </tr>

                        <tr class="service">
                            <td class="tableitem">
                                <p class="itemtext">{{ $label }}</p>
                            </td>
                            <td class="tableitem">
                                <p class="itemtext">1</p>
                            </td>
                            <td class="tableitem">
                                <p class="itemtext">{{ number_format((float)($d['totals']['subtotal'] ?? 0), 0, ',', ' ') }} {{ $d['currency'] }}</p>
                            </td>
                            <td class="tableitem">
                                <p class="itemtext">{{ number_format((float)($d['totals']['subtotal'] ?? 0), 0, ',', ' ') }} {{ $d['currency'] }}</p>
                            </td>
                        </tr>

                        <tr class="service">
                            <td class="tableitem">
                                <p class="itemtext">Taxes</p>
                            </td>
                            <td class="tableitem"></td>
                            <td class="tableitem">
                                <p class="itemtext">—</p>
                            </td>
                            <td class="tableitem">
                                <p class="itemtext">{{ number_format((float)($d['totals']['tax'] ?? 0), 0, ',', ' ') }} {{ $d['currency'] }}</p>
                            </td>
                        </tr>

                        <tr class="tabletitle">
                            <td></td>
                            <td></td>
                            <td class="Rate">
                                <h2>Total</h2>
                            </td>
                            <td class="payment">
                                <h2>{{ number_format((float)($d['totals']['total'] ?? 0), 0, ',', ' ') }} {{ $d['currency'] }}</h2>
                            </td>
                        </tr>
                    </table>
                </div>

                <div id="legalcopy">
                    <p class="legal"><strong>Merci</strong>

                </div>
            </div>
        </div><!--End Invoice-->
    </div><!-- End Invoice Holder-->
</body>

</html>