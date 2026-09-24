<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

abstract class Controller
{
    /**
     * Generic structured JSON response wrapper.
     */
    protected function jsonResponse(
        bool $success,
        mixed $data = null,
        string $message = '',
        int $statusCode = 200): JsonResponse 
    {
        return response()->json([
            'success' => $success,
            'data'    => $data,
            'message' => $message,
        ], $statusCode);
    }
}
