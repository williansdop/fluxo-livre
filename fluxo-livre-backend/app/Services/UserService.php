<?php

namespace App\Services;

use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserService
{
    /**
     * Handle incoming user registration requests.
     *
     * @param  array  $userData  The validated registration payload.
     * @return User
     */
    public function signUp(array $userData): User
    {
        $userData['password'] = bcrypt($userData['password']);
        $user = User::create($userData);
        return $user;
    }

    /**
     * Handle incoming user login requests.
     *
     * @param  array  $userData  The validated registration payload.
     * @return array
     * @throws Exception
     */
    public function login(array $userData): ?array
    {
        $validation = false;

        $user = User::where('email', $userData['email'])->first();

        if (! $user || ! Hash::check($userData['password'], $user->password)) {
            return null;
        }

        $token = $user->createToken('auth_user')->plainTextToken;

        return [
            'user' => [
                'id'         => $user->id,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'email'      => $user->email,
            ],
            'token' => $token
        ];
    }
}