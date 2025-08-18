<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Article;

class ArticlePolicy
{
    public function before(User $auth, string $ability): ?bool
    {
        return $auth->hasRole('Admin') ? true : null; // Admin => tout
    }

    public function viewAny(User $auth): bool
    {
        return false;
    }
    public function view(User $auth, Article $a): bool
    {
        return false;
    }
    public function create(User $auth): bool
    {
        return false;
    }
    public function update(User $auth, Article $a): bool
    {
        return false;
    }
    public function delete(User $auth, Article $a): bool
    {
        return false;
    }
}
