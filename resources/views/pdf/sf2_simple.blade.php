<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>School Form 2 (SF2) - Daily Attendance Report of Learners</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0.4in;
        }
        
        body { 
            font-family: Arial, sans-serif; 
            font-size: 9px; 
            margin: 0;
            padding: 0;
            line-height: 1.2;
            color: #000;
        }
        
        .header {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            position: relative;
        }
        
        .deped-logo {
            width: 60px;
            height: 60px;
            border: 2px solid #000;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(45deg, #1e3a8a, #3b82f6);
            color: white;
            font-size: 8pt;
            font-weight: bold;
            text-align: center;
            margin-right: 20px;
            flex-shrink: 0;
        }
        
        .header-text {
            flex: 1;
            text-align: center;
            padding-top: 8px;
        }
        
        .republic-text {
            font-size: 11pt;
            font-weight: bold;
            margin-bottom: 2px;
        }
        
        .deped-text {
            font-size: 10pt;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .form-title {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 4px;
        }
        
        .form-subtitle {
            font-size: 8pt;
            font-style: italic;
            margin-bottom: 10px;
        }
        
        .form-info {
            display: grid;
            grid-template-columns: auto 1fr auto 1fr auto 1fr;
            gap: 15px;
            align-items: center;
            margin-bottom: 8px;
            font-size: 9pt;
        }
        
        .form-info-row2 {
            display: grid;
            grid-template-columns: auto 2fr auto 1fr auto 1fr;
            gap: 15px;
            align-items: center;
            margin-bottom: 15px;
            font-size: 9pt;
        }
        
        .field-label {
            font-weight: bold;
            white-space: nowrap;
        }
        
        .field-value {
            border: 1px solid #000;
            padding: 4px 8px;
            min-height: 16px;
            display: flex;
            align-items: center;
            background: white;
        }
        
        .main-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7pt;
            margin-bottom: 8px;
            border: 2px solid #000;
        }
        
        .main-table th,
        .main-table td {
            border: 1px solid #000;
            padding: 2px;
            text-align: center;
            vertical-align: middle;
        }
        
        .main-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        .main-table th:first-child,
        .main-table td:first-child {
            border-left: 2px solid #000;
        }
        
        .main-table th:last-child,
        .main-table td:last-child {
            border-right: 2px solid #000;
        }
        
        .main-table thead th {
            border-top: 2px solid #000;
        }
        
        .main-table tbody tr:last-child td {
            border-bottom: 2px solid #000;
        }
        
        .name-header {
            width: 120px;
            text-align: center;
            font-size: 7pt;
            padding: 4px;
            line-height: 1.1;
        }
        
        .name-cell {
            width: 120px;
            text-align: left;
            padding: 3px;
            font-size: 7pt;
        }
        
        .day-header {
            width: 12px;
            font-size: 6pt;
            writing-mode: vertical-lr;
            text-orientation: mixed;
            padding: 2px;
        }
        
        .day-cell {
            width: 12px;
            height: 20px;
            font-size: 7pt;
            position: relative;
        }
        
        .day-cell::before {
            content: "";
            position: absolute;
            top: 1px;
            left: 1px;
            right: 1px;
            bottom: 1px;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 1px,
                #e0e0e0 1px,
                #e0e0e0 2px
            );
        }
        
        .total-header {
            width: 25px;
            font-size: 6pt;
            writing-mode: vertical-lr;
            text-orientation: mixed;
            padding: 2px;
        }
        
        .total-cell {
            width: 25px;
            font-size: 7pt;
        }
        
        .remarks-header {
            width: 80px;
            font-size: 6pt;
            padding: 2px;
            line-height: 1.0;
        }
        
        .remarks-cell {
            width: 80px;
            font-size: 6pt;
            padding: 2px;
            text-align: left;
        }
        
        .gender-section {
            background-color: #e8e8e8;
            font-weight: bold;
            text-align: center;
            padding: 4px;
            border-top: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
            font-size: 8pt;
        }
        
        .gender-section td:first-child {
            text-align: left;
            font-weight: bold;
        }
        
        .combined-total {
            background-color: #d0d0d0;
            font-weight: bold;
            text-align: center;
            padding: 4px;
            border-top: 1.5px solid #000;
            font-size: 8pt;
        }
        
        .combined-total td:first-child {
            text-align: center;
            font-weight: bold;
        }
        
        .bottom-sections {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 8px;
            margin-top: 10px;
            font-size: 6.5pt;
        }
        
        .guidelines-section,
        .codes-section,
        .summary-section {
            border: 1px solid #000;
            padding: 6px;
            height: fit-content;
        }
        
        .section-title {
            font-weight: bold;
            font-size: 7pt;
            margin-bottom: 4px;
            text-decoration: underline;
        }
        
        .guidelines-section ol {
            margin: 0;
            padding-left: 12px;
        }
        
        .guidelines-section li {
            margin-bottom: 2px;
            line-height: 1.1;
        }
        
        .formula {
            margin: 4px 0;
            font-size: 6pt;
            line-height: 1.2;
        }
        
        .formula-line {
            text-decoration: underline;
            font-weight: bold;
        }
        
        .codes-content {
            font-size: 6pt;
            line-height: 1.1;
        }
        
        .codes-content p {
            margin: 3px 0;
        }
        
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin: 4px 0;
        }
        
        .summary-table td,
        .summary-table th {
            border: 1px solid #000;
            padding: 2px;
            text-align: center;
            font-size: 6pt;
        }
        
        .summary-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        .signature-section {
            margin-top: 8px;
            text-align: center;
            font-size: 6pt;
        }
        
        .signature-line {
            border-bottom: 1px solid #000;
            width: 150px;
            height: 15px;
            margin: 4px auto;
        }
        
        .page-footer {
            position: absolute;
            bottom: 10px;
            left: 10px;
            font-size: 8pt;
            font-weight: bold;
        }
        
        /* Print styles */
        @media print {
            body { margin: 0; padding: 0; }
            .page-footer { position: fixed; }
        }
        
        /* Status symbols */
        .present { color: transparent; }
        .absent { color: #000; font-weight: bold; }
        .late { color: #666; font-weight: bold; }
    </style>
</head>
<body>
    <!-- Header Section -->
    <div class="header">
        <div class="deped-logo">
            DepEd<br>LOGO
        </div>
        <div class="header-text">
            <div class="republic-text">REPUBLIC OF THE PHILIPPINES</div>
            <div class="deped-text">DEPARTMENT OF EDUCATION</div>
            <div class="form-title">School Form 2 (SF2) Daily Attendance Report of Learners</div>
            <div class="form-subtitle">(This replaces Form 1, Form 2 & STS Form 4 - Absenteeism and Dropout Profile)</div>
        </div>
    </div>
    
    <!-- Form Information Fields -->
    <div class="form-info">
        <span class="field-label">School ID</span>
        <div class="field-value">{{ $schoolSettings['school_id'] ?? 'N/A' }}</div>
        <span class="field-label">School Year</span>
        <div class="field-value">{{ $year }}-{{ $year + 1 }}</div>
        <span class="field-label">Report for the Month of</span>
        <div class="field-value">{{ date('F Y', mktime(0, 0, 0, $month, 1, $year)) }}</div>
    </div>
    
    <div class="form-info-row2">
        <span class="field-label">Name of School</span>
        <div class="field-value">{{ $schoolSettings['school_name'] ?? 'SAMPLE SCHOOL' }}</div>
        <span class="field-label">Grade Level</span>
        <div class="field-value">{{ $gradeLevel->name ?? 'N/A' }}</div>
        <span class="field-label">Section</span>
        <div class="field-value">{{ $section->name ?? 'N/A' }}</div>
    </div>
    
    <!-- Main Attendance Table -->
    <table class="main-table">
        <thead>
            <tr>
                <th rowspan="2" class="name-header">LEARNER'S NAME<br>(Last Name, First Name, Middle Name)</th>
                @php
                    $daysInMonth = date('t', mktime(0, 0, 0, $month, 1, $year));
                    $schoolDays = [];
                    $dayNames = ['M', 'T', 'W', 'TH', 'F'];
                    
                    for($day = 1; $day <= $daysInMonth; $day++) {
                        $dayOfWeek = date('N', mktime(0, 0, 0, $month, $day, $year));
                        if($dayOfWeek >= 1 && $dayOfWeek <= 5) {
                            $schoolDays[] = $day;
                        }
                    }
                    $schoolDaysCount = count($schoolDays);
                @endphp
                <th colspan="{{ $schoolDaysCount }}" style="font-size: 7pt;">(1st row for date)</th>
                <th rowspan="2" class="total-header">Total for the Month</th>
                <th rowspan="2" class="total-header">ABSENT</th>
                <th rowspan="2" class="total-header">TARDY</th>
                <th rowspan="2" class="remarks-header">REMARKS<br>(If DROPPED OUT, state reason, please refer to legend number 2.<br><br>If TRANSFERRED IN/OUT, write the name of School.)</th>
            </tr>
            <tr>
                @foreach($schoolDays as $day)
                    @php
                        $dayOfWeek = date('N', mktime(0, 0, 0, $month, $day, $year));
                        $dayName = $dayNames[$dayOfWeek - 1];
                    @endphp
                    <th class="day-header">{{ $dayName }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            <!-- Male Students Section -->
            @if($maleStudents->count() > 0)
                @foreach($maleStudents as $student)
                <tr>
                    <td class="name-cell">{{ strtoupper($student->name) }}</td>
                    @foreach($schoolDays as $day)
                        @php
                            $attendanceDate = $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT) . '-' . str_pad($day, 2, '0', STR_PAD_LEFT);
                            $attendance = $student->attendances->where('date', $attendanceDate)->first();
                            $status = $attendance ? $attendance->status : '';
                        @endphp
                        <td class="day-cell">
                            @if($status === 'present')
                                <span class="present">P</span>
                            @elseif($status === 'absent')
                                <span class="absent">/</span>
                            @elseif($status === 'late')
                                <span class="late">T</span>
                            @endif
                        </td>
                    @endforeach
                    <td class="total-cell">{{ $student->attendances->where('status', 'present')->count() + $student->attendances->where('status', 'late')->count() }}</td>
                    <td class="total-cell">{{ $student->attendances->where('status', 'absent')->count() }}</td>
                    <td class="total-cell">{{ $student->attendances->where('status', 'late')->count() }}</td>
                    <td class="remarks-cell">{{ $student->remarks ?? '' }}</td>
                </tr>
                @endforeach
                
                <!-- Male Total Row -->
                <tr class="gender-section">
                    <td>⟵ MALE | TOTAL Per Day ⟶</td>
                    @foreach($schoolDays as $day)
                        <td></td>
                    @endforeach
                    <td></td><td></td><td></td><td></td>
                </tr>
            @endif
            
            <!-- Female Students Section -->
            @if($femaleStudents->count() > 0)
                @foreach($femaleStudents as $student)
                <tr>
                    <td class="name-cell">{{ strtoupper($student->name) }}</td>
                    @foreach($schoolDays as $day)
                        @php
                            $attendanceDate = $year . '-' . str_pad($month, 2, '0', STR_PAD_LEFT) . '-' . str_pad($day, 2, '0', STR_PAD_LEFT);
                            $attendance = $student->attendances->where('date', $attendanceDate)->first();
                            $status = $attendance ? $attendance->status : '';
                        @endphp
                        <td class="day-cell">
                            @if($status === 'present')
                                <span class="present">P</span>
                            @elseif($status === 'absent')
                                <span class="absent">/</span>
                            @elseif($status === 'late')
                                <span class="late">T</span>
                            @endif
                        </td>
                    @endforeach
                    <td class="total-cell">{{ $student->attendances->where('status', 'present')->count() + $student->attendances->where('status', 'late')->count() }}</td>
                    <td class="total-cell">{{ $student->attendances->where('status', 'absent')->count() }}</td>
                    <td class="total-cell">{{ $student->attendances->where('status', 'late')->count() }}</td>
                    <td class="remarks-cell">{{ $student->remarks ?? '' }}</td>
                </tr>
                @endforeach
                
                <!-- Female Total Row -->
                <tr class="gender-section">
                    <td>⟵ FEMALE | TOTAL Per Day ⟶</td>
                    @foreach($schoolDays as $day)
                        <td></td>
                    @endforeach
                    <td></td><td></td><td></td><td></td>
                </tr>
            @endif
            
            <!-- Combined Total Row -->
            <tr class="combined-total">
                <td><strong>Combined TOTAL PER DAY</strong></td>
                @foreach($schoolDays as $day)
                    <td></td>
                @endforeach
                <td></td><td></td><td></td><td></td>
            </tr>
        </tbody>
    </table>
    
    <!-- Bottom Section with Guidelines, Codes, and Summary -->
    <div class="bottom-sections">
        <!-- Guidelines Section -->
        <div class="guidelines-section">
            <div class="section-title">GUIDELINES:</div>
            <ol>
                <li>The attendance shall be accomplished daily. Refer to the codes for checking learners' attendance.</li>
                <li>Learner's Name shall be written in the following format: Last Name, First Name, Middle Name.</li>
                <li>To compute the following:</li>
            </ol>
            
            <div class="formula">
                <strong>a. Percentage of Enrollment =</strong><br>
                <span class="formula-line">Registered Learners as of end of the month</span> × 100<br>
                Enrolled at the Beginning of School year
            </div>
            
            <div class="formula">
                <strong>b. Average Daily Attendance =</strong><br>
                <span class="formula-line">Total Daily Attendance</span><br>
                Number of School Days in reporting month
            </div>
            
            <div class="formula">
                <strong>c. Percentage of Attendance for the month =</strong><br>
                <span class="formula-line">Average daily attendance</span> × 100<br>
                Registered Learners as of end of the month
            </div>
            
            <ol start="4">
                <li>Every end of the month, the class adviser will submit this form to the office of the principal for recording of summary table into School Form 10.</li>
                <li>Once signed by the principal, this form should be returned to the class adviser.</li>
                <li>The adviser will provide necessary interventions including but not limited to home visitation to learners who were absent for 5 consecutive days and/or those at risk of dropping out.</li>
                <li>Attendance performance of learners will be reflected in Form 137 and Form 138 every grading period.</li>
            </ol>
            <p><strong>*</strong> Beginning of School Year cut-off report is every 1st Friday of the School Year</p>
        </div>
        
        <!-- Codes Section -->
        <div class="codes-section">
            <div class="section-title">1. CODES FOR CHECKING ATTENDANCE</div>
            <div class="codes-content">
                <p>(blank) = Present; (/) = Absent; (T) = Tardy (Half-shaded Upper for Late Coming); (X) = Lower for Early Out); ★ = Suspended/Others; Lower for Cutting Classes</p>
            </div>
            
            <div class="section-title">2. REASONS/CAUSES FOR DROPPING OUT</div>
            <div class="codes-content">
                <p><strong>a. Economic-Related Factors</strong><br>
                a.1. Lack of personal care or savings<br>
                a.2. Early marriage<br>
                a.3. Engaged in income-generating activities/livelihood<br>
                a.4. Family problems</p>
                
                <p><strong>b. Individual-Related Factors</strong><br>
                b.1. Illness; b.2. Overage; b.3. Death/substance<br>
                b.4. Drug Abuse; b.5. Poor academic performance<br>
                b.6. Lack of interest/low self esteem<br>
                b.7. Hunger/Malnutrition</p>
                
                <p><strong>c. School-Related Factors</strong><br>
                c.1. Teacher Factor<br>
                c.2. Physical condition of classroom<br>
                c.3. Peer influence</p>
                
                <p><strong>d. Geographical/Environmental</strong><br>
                d.1. Distance between home and school<br>
                d.2. Armed conflict (incl. Tribal wars & conflicting)<br>
                d.3. Calamities/Disasters</p>
                
                <p><strong>e. Financial-Related</strong><br>
                e.1. Child labor, work</p>
                
                <p><strong>f. Others (Specify)</strong></p>
            </div>
        </div>
        
        <!-- Summary Section -->
        <div class="summary-section">
            <div class="section-title">Month: {{ date('F Y', mktime(0, 0, 0, $month, 1, $year)) }}</div>
            
            <p style="text-align: center; font-weight: bold; margin: 4px 0;">
                <strong>No. of Days of Classes: {{ $schoolDaysCount }}</strong>
            </p>
            
            <table class="summary-table">
                <tr>
                    <th>Summary</th>
                    <th>M</th>
                    <th>F</th>
                    <th>TOTAL</th>
                </tr>
                <tr>
                    <td>Enrollment</td>
                    <td>{{ $summary['male_count'] }}</td>
                    <td>{{ $summary['female_count'] }}</td>
                    <td>{{ $summary['total_students'] }}</td>
                </tr>
            </table>
            
            <div style="font-size: 6pt; line-height: 1.2; margin-top: 4px;">
                <p><strong>* Enrollment as of (1st Friday of June)</strong></p>
                <p><strong>Late Enrollment during the month (Beyond cut-off)</strong></p>
                <p><strong>Registered Learners as of end of the month:</strong> {{ $summary['total_students'] }}</p>
                <p><strong>Percentage of Enrollment as of end of the month:</strong> {{ $summary['percentage_enrolment'] ?? 'N/A' }}%</p>
                <p><strong>Average Daily Attendance:</strong> {{ $summary['average_daily_attendance'] }}</p>
                <p><strong>Percentage of Attendance for the month:</strong> {{ $summary['percentage_attendance'] }}%</p>
                <p><strong>Number of students absent for 5 consecutive days:</strong> ___</p>
                <p><strong>Drop out:</strong> ___</p>
                <p><strong>Transferred out:</strong> ___</p>
                <p><strong>Transferred in:</strong> ___</p>
            </div>
            
            <div class="signature-section">
                <p style="font-style: italic;">I certify that this is a true and correct report.</p>
                <div class="signature-line"></div>
                <p>(Signature of Teacher over Printed Name)</p>
                <p style="margin-top: 8px;"><strong>Attested by:</strong></p>
                <div class="signature-line"></div>
                <p>(Signature of School Head over Printed Name)</p>
            </div>
        </div>
    </div>
    
    <div class="page-footer">School Form 2: Page __ of ______</div>
</body>
</html>