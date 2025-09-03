<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function send(string $toPhoneNumber, string $message): bool
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = config('services.twilio.from');
        $enabled = (bool) config('services.twilio.enabled', false);
        $defaultCountryCode = config('services.twilio.default_country_code');

        if (!$enabled) {
            Log::info('[SmsService] SMS disabled; skipping send', [
                'to' => $toPhoneNumber,
                'message' => $message,
            ]);
            return true;
        }

        if (!$sid || !$token || !$from) {
            Log::warning('[SmsService] Missing Twilio configuration; cannot send SMS');
            return false;
        }

        // Normalize and validate phone numbers to E.164
        $normalizedTo = $this->normalizeToE164($toPhoneNumber, $defaultCountryCode);
        $isMessagingService = str_starts_with((string) $from, 'MG');
        $normalizedFrom = $isMessagingService ? null : $this->normalizeToE164($from, null);
        if (!$isMessagingService && !$normalizedFrom) {
            Log::error('[SmsService] Invalid Twilio FROM number. Must be in E.164.', [
                'from' => $from,
            ]);
            return false;
        }
        if (!$normalizedTo) {
            Log::error('[SmsService] Invalid destination number. Must be in E.164.', [
                'to' => $toPhoneNumber,
            ]);
            return false;
        }

        try {
            $url = "https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json";

            $payload = [
                'To' => $normalizedTo,
                'Body' => $message,
            ];

            if ($isMessagingService) {
                $payload['MessagingServiceSid'] = $from;
            } else {
                $payload['From'] = $normalizedFrom;
            }

            $response = Http::withBasicAuth($sid, $token)
                ->asForm()
                ->post($url, $payload);

            if (!$response->successful()) {
                Log::error('[SmsService] Failed to send SMS', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('[SmsService] Exception sending SMS', [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Attempt to normalize a phone number to E.164 format.
     * Falls back to null if invalid or cannot be normalized.
     */
    private function normalizeToE164(string $rawPhone, ?string $defaultCountryCode): ?string
    {
        $trimmed = trim($rawPhone);
        // Remove spaces, dashes, parentheses
        $digits = preg_replace('/[\s\-()]/', '', $trimmed);

        // If already E.164
        if (preg_match('/^\+[1-9]\d{1,14}$/', $digits)) {
            return $digits;
        }

        // If starts with + but invalid -> reject
        if (str_starts_with($digits, '+')) {
            return null;
        }

        // If we have a default country code, try to build E.164
        if ($defaultCountryCode) {
            $cleanCode = ltrim((string) $defaultCountryCode, '+');
            // Common local formats starting with 0 -> drop leading 0
            $local = ltrim($digits, '0');
            $candidate = '+' . $cleanCode . $local;
            if (preg_match('/^\+[1-9]\d{1,14}$/', $candidate)) {
                return $candidate;
            }
        }

        return null;
    }
}


