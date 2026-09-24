<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class CategoryController extends Controller
{
    public function getAllCategories(CategoryService $categoryService): JsonResponse
    {
        try {
            Log::info("Obstacle retrieval - all: Beginning execution.");
            $obstacles = $categoryService->getAllCategories();
    
            if ($obstacles->isEmpty()) {
                return $this->jsonResponse(false, null, 'Nenhum obstáculo encontrado.', 404);
            }
    
            return $this->jsonResponse(true, $obstacles, 'Obstáculos recuperados com sucesso.');
        } catch (Throwable $e){
            Log::error('Registration failed: ' . $e->getMessage(), ['exception' => $e]);

            return $this->jsonResponse(
                false,
                null,
                'Ocorreu um erro inesperado durante a criação do obstáculo.',
                500
            );
        }
    }
}