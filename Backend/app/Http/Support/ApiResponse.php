<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    protected function ok(array $data = [], int $status = 200): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $data], $status);
    }

    protected function created(array $data = []): JsonResponse
    {
        return $this->ok($data, 201);
    }

    protected function fail(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        return response()->json(['success' => false, 'message' => $message, 'errors' => $errors], $status);
    }
}
