<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class UpdateObstacleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        Log::info("Obstacle update: Beginning input data validation.");
        
        return [
            'title'       => ['sometimes', 'required', 'string', 'max:100'],
            'description' => ['sometimes', 'required', 'string', 'max:500'],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'latitude'    => ['sometimes', 'required', 'numeric', 'between:-90,90'],
            'longitude'   => ['sometimes', 'required', 'numeric', 'between:-180,180'],      
            'user_id'     => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}