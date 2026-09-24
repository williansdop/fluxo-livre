<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class UserController extends Controller
{
    public function signUp(StoreUserRequest $request, UserService $userService): JsonResponse
    {
        try{
            Log::info("User creation: Beginning execution.");

            $userData = $request->validated();
            $user = $userService->signUp($userData);

            $token = $user->createToken('auth_token')->plainTextToken;

            $returnData = [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'token' => $token
            ];
            $message = "Usuário criado com sucesso com id {$user->id}";

            return $this->jsonResponse(true, $returnData, $message, 201);
        } catch (Throwable $e) {
            Log::error('Registration failed: ' . $e->getMessage(), ['exception' => $e]);

            return $this->jsonResponse(
                false,
                null,
                'Ocorreu um erro inesperado durante o registro.',
                500
            );
        }
    }

    public function login(LoginRequest $request, UserService $userService): JsonResponse
    {
        try{
            Log::info("User login: Beginning execution.");

            $userData = $request->validated();
            $validation = $userService->login($userData);

            $message = $validation ? "Login feito com sucesso." : 
                "Credenciais Inválidas para o e-mail.";
            $data = $validation ? $validation : null;
            $code = $validation ? 200 : 401;
            $success = $validation ? true : false;

            return $this->jsonResponse($success, $data, $message, $code);
        } catch (Throwable $e) {
            Log::error('Login failed: ' . $e->getMessage(), ['exception' => $e]);

            return $this->jsonResponse(
                false,
                null,
                'Ocorreu um erro inesperado durante o login',
                500
            );
        }
    }
}