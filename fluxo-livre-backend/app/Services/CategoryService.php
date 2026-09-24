<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
class CategoryService
{
    /**
     * Handle incoming specific all-categories retrieval requests.
     *
     * @return Collection
     */
    public function getAllCategories(): Collection
    {
        $categories = Category::get();

        return $categories;
    }   
}