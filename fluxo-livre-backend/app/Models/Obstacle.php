<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Obstacle extends Model
{
    use SoftDeletes, HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'title',
        'description',
        'latitude',
        'longitude',
    ];

    /**
     * User that created this Obstacle
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * This Obstacle's category
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Users that supported this Obstacle
     */
    public function supporters(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'obstacle_user')
                    ->withTimestamps();
    }

    /**
     * Comments related to this Obstacle
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}