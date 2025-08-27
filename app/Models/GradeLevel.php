<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GradeLevel extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'level',
    ];

    protected $casts = [
        'level' => 'integer',
    ];

    /**
     * Get the students for this grade level.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Get the sections for this grade level.
     */
    public function sections()
    {
        return $this->hasMany(Section::class);
    }
}
