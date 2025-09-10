<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    public function send(string $toPhoneNumber, string $message): bool
    {
        $enabled = (bool) config('services.semaphore.enabled', false);
        $apiKey = config('services.semaphore.api_key');
        $senderName = config('services.semaphore.sender_name');
        $defaultCountryCode = config('services.semaphore.default_country_code');

        if (!$enabled) {
            Log::info('[SmsService] SMS disabled; skipping send', [
                'to' => $toPhoneNumber,
                'message' => $message,
            ]);
            return true;
        }

        if (!$apiKey) {
            Log::warning('[SmsService] Missing Semaphore configuration; cannot send SMS');
            return false;
        }

        // Normalize and validate phone numbers to E.164
        $normalizedTo = $this->normalizeToE164($toPhoneNumber, $defaultCountryCode);
        // Semaphore does not require E.164 from-number; optional sender name must be pre-approved.
        if (!$normalizedTo) {
            Log::error('[SmsService] Invalid destination number. Must be in E.164.', [
                'to' => $toPhoneNumber,
            ]);
            return false;
        }

        try {
            $url = 'https://api.semaphore.co/api/v4/messages';

            $payload = [
                'apikey' => $apiKey,
                'number' => $normalizedTo,
                'message' => $message,
            ];
            if (!empty($senderName)) {
                $payload['sendername'] = $senderName;
            }

            $response = Http::asForm()->post($url, $payload);

            if (!$response->successful()) {
                Log::error('[SmsService] Failed to send SMS via Semaphore', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::error('[SmsService] Exception sending SMS via Semaphore', [
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


