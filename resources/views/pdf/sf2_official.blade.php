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
            line-height: 1.1;
        }
        
        .header-section {
            margin-bottom: 12px;
        }
        
        .republic-header {
            text-align: center;
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .sf2-title { 
            text-align: center; 
            font-weight: bold; 
            font-size: 14px; 
            margin-bottom: 2px; 
            text-transform: uppercase;
        }
        
        .sf2-subtitle { 
            text-align: center; 
            font-size: 8px; 
            margin-bottom: 12px; 
            font-style: italic;
        }
        
        .header-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 9px;
        }
        
        .header-left, .header-right {
            flex: 1;
        }
        
        .header-left div, .header-right div {
            margin-bottom: 4px;
        }
        
        .underline {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 120px;
            margin-left: 5px;
            padding-bottom: 1px;
        }
        
        .main-table-container {
            width: 100%;
            overflow-x: auto;
        }
        
        table.sf2 { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 8px;
            table-layout: fixed;
            border: 2px solid #000;
        }
        
        table.sf2 th, table.sf2 td { 
            border: 1px solid #000; 
            padding: 1px; 
            text-align: center; 
            vertical-align: middle;
        }
        
        table.sf2 th { 
            background: #f0f0f0; 
            font-weight: bold;
            font-size: 7px;
        }
        
        .name-col { 
            text-align: left; 
            width: 160px;
            font-size: 7px;
            padding-left: 3px;
            font-weight: normal;
        }
        
        .name-header {
            width: 160px;
            font-size: 8px;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
        }
        
        .date-col {
            width: 14px;
            font-size: 7px;
            min-width: 14px;
        }
        
        .total-col {
            width: 28px;
            font-size: 7px;
            font-weight: bold;
        }
        
        .rotate { 
            writing-mode: vertical-lr; 
            transform: rotate(180deg); 
            font-size: 6px;
            height: 35px;
            white-space: nowrap;
        }
        
        .days-header {
            font-size: 9px;
            font-weight: bold;
            text-align: center;
        }
        
        .gender-section {
            margin-bottom: 20px;
        }
        
        .gender-title {
            font-size: 10px;
            font-weight: bold;
            text-align: center;
            background: #e0e0e0;
            padding: 4px;
            border: 1px solid #000;
            margin-bottom: 5px;
        }
        
        .summary-section {
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            font-size: 8px;
        }
        
        .summary-left {
            width: 65%;
        }
        
        .summary-right {
            width: 30%;
        }
        
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
            margin-bottom: 10px;
        }
        
        .summary-table th, .summary-table td {
            border: 1px solid #000;
            padding: 2px 4px;
            text-align: left;
        }
        
        .summary-table th {
            background: #f0f0f0;
            font-weight: bold;
            text-align: center;
        }
        
        .guidelines {
            font-size: 7px;
            margin-top: 10px;
        }
        
        .guidelines-title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .legend {
            margin-top: 8px;
            font-size: 8px;
        }
        
        .legend-item {
            display: inline-block;
            margin-right: 15px;
            margin-bottom: 2px;
        }
        
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            font-size: 8px;
        }
        
        .signature-box {
            text-align: center;
            width: 200px;
        }
        
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 25px;
            padding-top: 3px;
        }
        
        .page-number {
            text-align: right;
            font-size: 8px;
            margin-top: 10px;
        }
        
        /* Attendance status styling */
        .present { color: #000; }
        .absent { color: #000; font-weight: bold; }
        .late { color: #000; font-weight: bold; }
        
        /* Print optimizations */
        @media print {
            body { 
                font-size: 8px; 
                padding: 5px;
            }
            .sf2-title { font-size: 12px; }
            .header-info { font-size: 8px; }
            table.sf2 { font-size: 7px; }
            .name-col { font-size: 6px; }
        }
    </style>
</head>
<body>
    <div class="header-section">
        <div class="republic-header">
            Republic of the Philippines<br>
            Department of Education
        </div>
        
        <div class="sf2-title">School Form 2 (SF2)</div>
        <div class="sf2-title">Daily Attendance Report of Learners</div>
        <div class="sf2-subtitle">(This replaces Form 1, Form 2 & STS Form 4 - Absenteeism and Dropout Profile)</div>
        
        <div class="header-info">
            <div class="header-left">
                <div><strong>School ID:</strong> <span class="underline">__________________</span></div>
                <div><strong>School:</strong> <span class="underline">__________________</span></div>
                <div><strong>School Year:</strong> <span class="underline">{{ $year }}</span></div>
            </div>
            <div class="header-right">
                <div><strong>Report for the Month of:</strong> <span class="underline">{{ DateTime::createFromFormat('!m', $month)->format('F') }}</span></div>
                <div><strong>Grade Level:</strong> <span class="underline">{{ $gradeLevel->name ?? 'N/A' }}</span></div>
                <div><strong>Section:</strong> <span class="underline">{{ $section->name ?? 'N/A' }}</span></div>
            </div>
        </div>
    </div>
    
    <!-- Male Students Section -->
    @if($maleStudents->count() > 0)
    <div class="gender-section">
        <div class="gender-title">MALE STUDENTS</div>
        <div class="main-table-container">
            <table class="sf2">
                <thead>
                    <tr>
                        <th rowspan="3" class="name-header">LEARNER'S NAME<br>(Last Name, First Name, Middle Name)</th>
                        <th colspan="31" class="days-header">DAYS OF THE MONTH</th>
                        <th rowspan="2" class="total-col">Total for the<br>Month</th>
                        <th rowspan="3" class="total-col">REMARKS<br>(If DROPPED OUT, state reason.<br>If TRANSFERRED IN/OUT,<br>write the name of School.)</th>
                    </tr>
                    <tr>
                        @for ($d = 1; $d <= 31; $d++)
                            <th class="date-col">{{ $d }}</th>
                        @endfor
                    </tr>
                    <tr>
                        @for ($d = 1; $d <= 31; $d++)
                            @php
                                $date = \Carbon\Carbon::create($year, $month, $d);
                                $dayName = $date->format('D');
                            @endphp
                            <th class="date-col rotate">{{ $dayName }}</th>
                        @endfor
                        <th class="total-col">ABSENT<br>TARDY</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($maleStudents as $student)
                        <tr>
                            <td class="name-col">
                                {{ $student->name }}
                                @if($student->lrn)
                                    <br><small>LRN: {{ $student->lrn }}</small>
                                @endif
                                @if($student->date_of_birth)
                                    <br><small>DOB: {{ $student->date_of_birth->format('m/d/Y') }}</small>
                                @endif
                            </td>
                            @php
                                $present = $absent = $late = 0;
                                $attendances = collect($student->attendances);
                            @endphp
                            @for ($d = 1; $d <= 31; $d++)
                                @php
                                    $record = $attendances->first(function($a) use ($d, $month, $year) {
                                        return \Carbon\Carbon::parse($a->date)->day == $d && \Carbon\Carbon::parse($a->date)->month == $month && \Carbon\Carbon::parse($a->date)->year == $year;
                                    });
                                @endphp
                                <td>
                                    @if ($record)
                                        @if ($record->status === 'absent')
                                            @php $absent++; @endphp
                                            <span class="absent">X</span>
                                        @elseif ($record->status === 'late')
                                            @php $late++; $present++; @endphp
                                            <span class="late">L</span>
                                        @else
                                            @php $present++; @endphp
                                            <span class="present">✓</span>
                                        @endif
                                    @endif
                                </td>
                            @endfor
                            <td>{{ $absent }}<br>{{ $late }}</td>
                            <td style="font-size: 7px;"></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    @endif

    <!-- Female Students Section -->
    @if($femaleStudents->count() > 0)
    <div class="gender-section">
        <div class="gender-title">FEMALE STUDENTS</div>
        <div class="main-table-container">
            <table class="sf2">
                <thead>
                    <tr>
                        <th rowspan="3" class="name-header">LEARNER'S NAME<br>(Last Name, First Name, Middle Name)</th>
                        <th colspan="31" class="days-header">DAYS OF THE MONTH</th>
                        <th rowspan="2" class="total-col">Total for the<br>Month</th>
                        <th rowspan="3" class="total-col">REMARKS<br>(If DROPPED OUT, state reason.<br>If TRANSFERRED IN/OUT,<br>write the name of School.)</th>
                    </tr>
                    <tr>
                        @for ($d = 1; $d <= 31; $d++)
                            <th class="date-col">{{ $d }}</th>
                        @endfor
                    </tr>
                    <tr>
                        @for ($d = 1; $d <= 31; $d++)
                            @php
                                $date = \Carbon\Carbon::create($year, $month, $d);
                                $dayName = $date->format('D');
                            @endphp
                            <th class="date-col rotate">{{ $dayName }}</th>
                        @endfor
                        <th class="total-col">ABSENT<br>TARDY</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($femaleStudents as $student)
                        <tr>
                            <td class="name-col">
                                {{ $student->name }}
                                @if($student->lrn)
                                    <br><small>LRN: {{ $student->lrn }}</small>
                                @endif
                                @if($student->date_of_birth)
                                    <br><small>DOB: {{ $student->date_of_birth->format('m/d/Y') }}</small>
                                @endif
                            </td>
                            @php
                                $present = $absent = $late = 0;
                                $attendances = collect($student->attendances);
                            @endphp
                            @for ($d = 1; $d <= 31; $d++)
                                @php
                                    $record = $attendances->first(function($a) use ($d, $month, $year) {
                                        return \Carbon\Carbon::parse($a->date)->day == $d && \Carbon\Carbon::parse($a->date)->month == $month && \Carbon\Carbon::parse($a->date)->year == $year;
                                    });
                                @endphp
                                <td>
                                    @if ($record)
                                        @if ($record->status === 'absent')
                                            @php $absent++; @endphp
                                            <span class="absent">X</span>
                                        @elseif ($record->status === 'late')
                                            @php $late++; $present++; @endphp
                                            <span class="late">L</span>
                                        @else
                                            @php $present++; @endphp
                                            <span class="present">✓</span>
                                        @endif
                                    @endif
                                </td>
                            @endfor
                            <td>{{ $absent }}<br>{{ $late }}</td>
                            <td style="font-size: 7px;"></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
    @endif
    
    <div class="summary-section">
        <div class="summary-left">
            <table class="summary-table">
                <thead>
                    <tr>
                        <th colspan="3">SUMMARY</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="width: 40%;">No. of Days of Classes:</td>
                        <td style="width: 30%;">{{ $summary['school_days'] }}</td>
                        <td style="width: 30%;">{{ $summary['school_days'] }}</td>
                    </tr>
                    <tr>
                        <td>Enrolment as of 1st Friday of the school year</td>
                        <td>{{ $summary['male_count'] }}</td>
                        <td>{{ $summary['female_count'] }}</td>
                    </tr>
                    <tr>
                        <td>Late Enrollment during the month (beyond cut-off)</td>
                        <td>0</td>
                        <td>0</td>
                    </tr>
                    <tr>
                        <td>Transferred in</td>
                        <td>0</td>
                        <td>0</td>
                    </tr>
                    <tr>
                        <td>Transferred out</td>
                        <td>0</td>
                        <td>0</td>
                    </tr>
                    <tr>
                        <td>Drop out</td>
                        <td>0</td>
                        <td>0</td>
                    </tr>
                    <tr>
                        <td>Number of students absent for 5 consecutive days:</td>
                        <td>0</td>
                        <td>0</td>
                    </tr>
                    <tr>
                        <td>Average Daily Attendance</td>
                        <td>{{ $summary['average_daily_attendance'] }}</td>
                        <td>{{ $summary['average_daily_attendance'] }}</td>
                    </tr>
                    <tr>
                        <td>Percentage of Attendance for the month</td>
                        <td>{{ $summary['percentage_attendance'] }}%</td>
                        <td>{{ $summary['percentage_attendance'] }}%</td>
                    </tr>
                    <tr>
                        <td>Percentage of Enrolment as of end of the month</td>
                        <td>{{ $summary['percentage_enrolment'] }}%</td>
                        <td>{{ $summary['percentage_enrolment'] }}%</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="summary-right">
            <div class="guidelines">
                <div class="guidelines-title">GUIDELINES:</div>
                <div><strong>1. CODES FOR CHECKING ATTENDANCE:</strong></div>
                <div style="margin-left: 10px;">
                    (blank) - Present<br>
                    (X) - Absent<br>
                    Tardy (half shaded = Upper for Late Commer, Lower for Cutting Classes)
                </div>
                <div style="margin-top: 5px;"><strong>2. REASONS/CAUSES FOR DROPPING OUT:</strong></div>
                <div style="margin-left: 10px; font-size: 6px;">
                    a. Domestic-Related Factors<br>
                    b. Individual-Related Factors<br>
                    c. School-Related Factors<br>
                    d. Geographic/Environmental<br>
                    e. Financial-Related<br>
                    f. Others (Specify)
                </div>
            </div>
        </div>
    </div>
    
    <div class="legend">
        <div class="legend-item"><strong>Legend:</strong></div>
        <div class="legend-item">✓ = Present</div>
        <div class="legend-item">X = Absent</div>
        <div class="legend-item">L = Late</div>
        <div class="legend-item">Blank = No School/Holiday</div>
    </div>
    
    <div class="signature-section">
        <div class="signature-box">
            <div>I certify that this is a true and correct report.</div>
            <div class="signature-line">
                <div>(Signature of Teacher over Printed Name)</div>
            </div>
        </div>
        <div class="signature-box">
            <div>Attested by:</div>
            <div class="signature-line">
                <div>(Signature of School Head over Printed Name)</div>
            </div>
        </div>
    </div>
    
    <div class="page-number">
        School Form 2 : Page 1 of 1
    </div>
</body>
</html>
