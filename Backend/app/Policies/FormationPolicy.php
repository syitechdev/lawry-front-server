<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Formation;

class FormationPolicy
{
    public function before(User $auth, string $ability): ?bool
    {
        return $auth->hasRole('Admin') ? true : null;
    }

    public function viewAny(?User $user): bool
    {
        return true;
    }
    public function view(?User $user, Formation $formation): bool
    {
        return true;
    }
    public function create(User $user): bool
    {
        return false;
    }
    public function update(User $user, Formation $formation): bool
    {
        return false;
    }
    public function delete(User $user, Formation $formation): bool
    {
        return false;
    }
}
