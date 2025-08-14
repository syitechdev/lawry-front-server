<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $auth): bool
    {
        return $auth->hasRole('Admin');
    }

    public function view(User $auth, User $target): bool
    {
        return $auth->hasRole('Admin') || $auth->id === $target->id;
    }

    public function create(User $auth): bool
    {
        return $auth->hasRole('Admin');
    }

    public function update(User $auth, User $target): bool
    {
        return $auth->hasRole('Admin') || $auth->id === $target->id;
    }

    public function delete(User $auth, User $target): bool
    {
        if (! $auth->hasRole('Admin')) return false;
        if ($auth->id === $target->id) return false;

        if ($target->hasRole('Admin')) {
            $otherAdmins = User::role('Admin')->where('id', '!=', $target->id)->count();
            if ($otherAdmins === 0) return false;
        }

        return true;
    }
}
