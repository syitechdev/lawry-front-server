<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Category;

class CategoryPolicy
{
    public function before(User $auth, string $ability): ?bool
    {
        return $auth->hasRole('Admin') ? true : null;
    }

    public function viewAny(User $auth): bool
    {
        return false;
    }
    public function view(User $auth, Category $c): bool
    {
        return false;
    }
    public function create(User $auth): bool
    {
        return false;
    }
    public function update(User $auth, Category $c): bool
    {
        return false;
    }
    public function delete(User $auth, Category $c): bool
    {
        return false;
    }
}
