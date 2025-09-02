<?php

namespace App\Policies;

use App\Models\NewsletterSubscription;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class NewsletterSubscriptionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('newsletter.read');
    }
    public function view(User $user, NewsletterSubscription $s): bool
    {
        return $user->can('newsletter.read');
    }
    public function delete(User $user, NewsletterSubscription $s): bool
    {
        return $user->can('newsletter.delete');
    }
}
