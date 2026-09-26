<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use SoftDeletes, HasFactory;

    protected $fillable = [
        'user_id',
        'obstacle_id',
        'content',
    ];

    /**
     * User that created the Comment
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Obstacle this comment belongs to
     */
    public function obstacle(): BelongsTo
    {
        return $this->belongsTo(Obstacle::class);
    }

    /**
     * Users that upvoted this Comment
     */
    public function likers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'comment_user')
                    ->withTimestamps();
    }
}