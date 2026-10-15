<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ObstacleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// O Laravel aplica automaticamente o prefixo '/api' a estas rotas
Route::middleware('guest')->group(function () {
    Route::post('/sign-up', [UserController::class, 'signUp'])->name('signup');
    Route::post('/login', [UserController::class, 'login'])->name('login');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout'])->name('logout');
    Route::get('/me', [UserController::class, 'me'])->name('me');

    Route::prefix('obstacles')->name('api.obstacles.')->group(function () {
        Route::post('/create', [ObstacleController::class, 'createObstacle'])->name('create');
        Route::put('/{id}', [ObstacleController::class, 'updateObstacle']);
        Route::delete('/{id}', [ObstacleController::class, 'deleteObstacle']);
        Route::get('/{id}', [ObstacleController::class, 'getObstacle'])->name('get-obstacle');
    });
});

Route::get('/obstacles', [ObstacleController::class, 'getAllObstacles'])->name('get-all-obstacles');

Route::get('/obstacle-categories', [CategoryController::class, 'getAllCategories'])->name('get-all-categories');