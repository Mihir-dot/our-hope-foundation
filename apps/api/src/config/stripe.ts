import Stripe from 'stripe';
import { env, hasStripe } from './env.js';

export const stripe: Stripe | null = hasStripe ? new Stripe(env.STRIPE_SECRET_KEY) : null;
