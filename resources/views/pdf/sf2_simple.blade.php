<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>School Form 2 (SF2) - Daily Attendance Report of Learners</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0.5in;
        }
        
        body { 
            font-family: Arial, sans-serif; 
            font-size: 10px; 
            margin: 0;
            padding: 8px;
            line-height: 1.2;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .subtitle {
            font-size: 8px;
            margin-bottom: 15px;
        }
        
        .info {
            margin-bottom: 15px;
            font-size: 9px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
            margin-bottom: 15px;
        }
        
        th, td {
            border: 1px solid #000;
            padding: 2px;
            text-align: center;
        }
        
        th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        .name-col {
            text-align: left;
            width: 150px;
        }
        
        .summary {
            margin-top: 20px;
            font-size: 9px;
        }
        
        .signature {
            margin-top: 30px;
            text-align: center;
            font-size: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">REPUBLIC OF THE PHILIPPINES</div>
        <div class="title">DEPARTMENT OF EDUCATION</div>
        <div class="title">School Form 2 (SF2) - Daily Attendance Report of Learners</div>
        <div class="subtitle">(This form is generated for the month and shows daily attendance)</div>
    </div>
    
    <div class="info">
        <strong>School Year:</strong> {{ $year }}-{{ $year + 1 }} | 
        <strong>Month:</strong> {{ date('F', mktime(0, 0, 0, $month, 1)) }} {{ $year }} | 
        <strong>Grade Level:</strong> {{ $gradeLevel->name }} | 
        <strong>Section:</strong> {{ $section->name }}
    </div>
    
    @if($maleStudents->count() > 0)
    <div>
        <h3>MALE STUDENTS</h3>
        <table>
            <thead>
                <tr>
                    <th class="name-col">Name</th>
                    <th>LRN</th>
                    <th>Date of Birth</th>
                    @for($day = 1; $day <= 31; $day++)
                        <th>{{ $day }}</th>
                    @endfor
                    <th>Total Present</th>
                    <th>Total Absent</th>
                </tr>
            </thead>
            <tbody>
                @foreach($maleStudents as $student)
                <tr>
                    <td class="name-col">{{ $student->name }}</td>
                    <td>{{ $student->lrn ?? 'N/A' }}</td>
                    <td>{{ $student->date_of_birth ? date('m/d/Y', strtotime($student->date_of_birth)) : 'N/A' }}</td>
                    @for($day = 1; $day <= 31; $day++)
                        @php
                            $attendance = $student->attendances->where('date', $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT) . '-' . str_pad($day, 2, '0', STR_PAD_LEFT))->first();
                        @endphp
                        <td>
                            @if($attendance)
                                @if($attendance->status == 'present')
                                    ✓
                                @elseif($attendance->status == 'absent')
                                    X
                                @elseif($attendance->status == 'late')
                                    L
                                @endif
                            @endif
                        </td>
                    @endfor
                    <td>{{ $student->attendances->where('status', 'present')->count() }}</td>
                    <td>{{ $student->attendances->where('status', 'absent')->count() }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif
    
    @if($femaleStudents->count() > 0)
    <div>
        <h3>FEMALE STUDENTS</h3>
        <table>
            <thead>
                <tr>
                    <th class="name-col">Name</th>
                    <th>LRN</th>
                    <th>Date of Birth</th>
                    @for($day = 1; $day <= 31; $day++)
                        <th>{{ $day }}</th>
                    @endfor
                    <th>Total Present</th>
                    <th>Total Absent</th>
                </tr>
            </thead>
            <tbody>
                @foreach($femaleStudents as $student)
                <tr>
                    <td class="name-col">{{ $student->name }}</td>
                    <td>{{ $student->lrn ?? 'N/A' }}</td>
                    <td>{{ $student->date_of_birth ? date('m/d/Y', strtotime($student->date_of_birth)) : 'N/A' }}</td>
                    @for($day = 1; $day <= 31; $day++)
                        @php
                            $attendance = $student->attendances->where('date', $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT) . '-' . str_pad($day, 2, '0', STR_PAD_LEFT))->first();
                        @endphp
                        <td>
                            @if($attendance)
                                @if($attendance->status == 'present')
                                    ✓
                                @elseif($attendance->status == 'absent')
                                    X
                                @elseif($attendance->status == 'late')
                                    L
                                @endif
                            @endif
                        </td>
                    @endfor
                    <td>{{ $student->attendances->where('status', 'present')->count() }}</td>
                    <td>{{ $student->attendances->where('status', 'absent')->count() }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif
    
    <div class="summary">
        <h3>SUMMARY</h3>
        <p><strong>Total Students:</strong> {{ $summary['total_students'] }}</p>
        <p><strong>Male Students:</strong> {{ $summary['male_count'] }}</p>
        <p><strong>Female Students:</strong> {{ $summary['female_count'] }}</p>
        <p><strong>Average Daily Attendance:</strong> {{ $summary['average_daily_attendance'] }}</p>
        <p><strong>Percentage Attendance:</strong> {{ $summary['percentage_attendance'] }}%</p>
    </div>
    
    <div class="signature">
        <p>I certify that this is a true and correct report.</p>
        <p>_________________________________</p>
        <p>(Signature of Teacher over Printed Name)</p>
    </div>
</body>
</html>
