<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'icon',
        'description',
    ];

    /**
     * All Obstacles that belong to this Category
     */
    public function obstacles(): HasMany
    {
        return $this->hasMany(Obstacle::class);
    }
}