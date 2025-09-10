<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SmsService;

class TestSendSms extends Command
{
    protected $signature = 'sms:test {to : Destination phone number in E.164 format} {--message=Test message from Zion Academy}';

    protected $description = 'Send a test SMS via Semaphore configuration to verify delivery';

    public function __construct(private SmsService $smsService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $to = $this->argument('to');
        $message = (string) $this->option('message');

        $this->info("Sending SMS to {$to} ...");
        $ok = $this->smsService->send($to, $message);
        if ($ok) {
            $this->info('SMS sent (or simulated if disabled).');
            return self::SUCCESS;
        }
        $this->error('Failed to send SMS. Check logs for details.');
        return self::FAILURE;
    }
}


