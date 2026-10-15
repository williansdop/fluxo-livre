<?php

namespace App\Services;

use App\Models\Obstacle;
use Illuminate\Database\Eloquent\Collection;

class ObstacleService
{
    /**
     * Handle incoming obstacle creation requests.
     *
     * @param  array  $obstacleData  The validated registration payload.
     * @return Obstacle
     */
    public function createObstacle(array $obstacleData): Obstacle
    {
        return Obstacle::create($obstacleData);
    }

    /**
     * Handle incoming specific obstacle retrieval requests.
     *
     * @param  int  $id
     * @return ?Obstacle
     */
    public function findObstacleWithCategoryAndUser(int $id): ?Obstacle
    {
        $obstacle = Obstacle::with(['category:id,title,icon', 'user:id,first_name,last_name'])->find($id);
        
        return $obstacle;
    }

    /**
     * Handle incoming specific all-obstacles retrieval requests.
     *
     * @return Collection
     */
    public function getAllObstacles(): Collection
    {
        $obstacles = Obstacle::with(['category:id,title,icon', 'user:id,first_name,last_name'])->get();

        return $obstacles;
    }

    /**
     * Handle incoming obstacle update requests.
     *
     * @param  Obstacle  $obstacle
     * @param  array     $data
     * @return Obstacle
     */
    public function updateObstacle(Obstacle $obstacle, array $data): Obstacle
    {
        $obstacle->update($data);
        return $obstacle->fresh(['category:id,title,icon', 'user:id,first_name,last_name']);
    }

    /**
     * Handle incoming obstacle deletion requests.
     *
     * @param  Obstacle  $obstacle
     * @return void
     */
    public function deleteObstacle(Obstacle $obstacle): void
    {
        $obstacle->delete();
    }
}