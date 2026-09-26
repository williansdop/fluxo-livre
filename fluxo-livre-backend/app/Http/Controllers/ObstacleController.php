<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateObstacleRequest;
use App\Http\Requests\UpdateObstacleRequest;
use App\Models\Obstacle;
use App\Services\ObstacleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class ObstacleController extends Controller
{
    public function createObstacle(CreateObstacleRequest $request, ObstacleService $obstacleService): JsonResponse
    {
        try{
            Log::info("Obstacle creation: Beginning execution.");

            $userId = $request->user()->id;
            $obstacleData = $request->validated();
            $obstacleData['user_id'] = $userId;
            $obstacle = $obstacleService->createObstacle($obstacleData);

            $returnData = [
                'id' => $obstacle->id,
                'title' => $obstacle->title
            ];
            $message = "Obstáculo criado com sucesso com id {$obstacle->id}";

            return $this->jsonResponse(true, $returnData, $message, 201);
        } catch (Throwable $e) {
            Log::error('Registration failed: ' . $e->getMessage(), ['exception' => $e]);

            return $this->jsonResponse(
                false,
                null,
                'Ocorreu um erro inesperado durante a criação do obstáculo.',
                500
            );
        }
    }

    public function getObstacle(ObstacleService $obstacleService, int $id): JsonResponse
    {
        try {
            Log::info("Obstacle retrieval: Beginning execution.");
            $obstacle = $obstacleService->findObstacleWithCategoryAndUser($id);
    
            if (!$obstacle) {
                return $this->jsonResponse(false, null, 'Obstáculo não encontrado.', 404);
            }
    
            return $this->jsonResponse(true, $obstacle, 'Obstáculo recuperado com sucesso.');
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

    public function getAllObstacles(ObstacleService $obstacleService): JsonResponse
    {
        try {
            Log::info("Obstacle retrieval - all: Beginning execution.");
            $obstacles = $obstacleService->getAllObstacles();
    
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

    public function updateObstacle(UpdateObstacleRequest $request, ObstacleService $obstacleService, int $id): JsonResponse
    {
        try {
            Log::info("Obstacle update: Beginning execution.");

            $obstacle = Obstacle::find($id);

            if (!$obstacle) {
                return $this->jsonResponse(false, null, 'Obstáculo não encontrado.', 404);
            }

            if ($obstacle->user_id !== $request->user()->id) {
                return $this->jsonResponse(false, null, 'Você não tem permissão para editar este obstáculo.', 403);
            }

            $updated = $obstacleService->updateObstacle($obstacle, $request->validated());

            return $this->jsonResponse(true, $updated, 'Obstáculo atualizado com sucesso.');
        } catch (Throwable $e) {
            Log::error('Obstacle update failed: ' . $e->getMessage(), ['exception' => $e]);

            return $this->jsonResponse(
                false,
                null,
                'Ocorreu um erro inesperado durante a atualização do obstáculo.',
                500
            );
        }
    }

    public function deleteObstacle(Request $request, ObstacleService $obstacleService, int $id): JsonResponse
    {
        try {
            Log::info("Obstacle deletion: Beginning execution.");

            $obstacle = Obstacle::find($id);

            if (!$obstacle) {
                return $this->jsonResponse(false, null, 'Obstáculo não encontrado.', 404);
            }

            if ($obstacle->user_id !== $request->user()->id) {
                return $this->jsonResponse(false, null, 'Você não tem permissão para excluir este obstáculo.', 403);
            }

            $obstacleService->deleteObstacle($obstacle);

            return $this->jsonResponse(true, null, 'Obstáculo excluído com sucesso.');
        } catch (Throwable $e) {
            Log::error('Obstacle deletion failed: ' . $e->getMessage(), ['exception' => $e]);

            return $this->jsonResponse(
                false,
                null,
                'Ocorreu um erro inesperado durante a exclusão do obstáculo.',
                500
            );
        }
    }
}