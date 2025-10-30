<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>School Form 2 (SF2) - Daily Attendance Report of Learners</title>
    <style>
        @page {
            size: legal landscape;
            margin: 0.3in;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        body { 
            font-family: Arial, Helvetica, sans-serif; 
            font-size: 9pt; 
            color: #000;
            background: white;
            padding: 15px;
        }
        
        .page {
            width: 100%;
            max-width: 13.5in;
            margin: 0 auto;
        }
        
        /* Header */
        .header-box {
            border: 3px solid #000;
            padding: 8px 12px;
        }
        
        .header-row {
            display: table;
            width: 100%;
        }
        
        .logo-left, .header-center, .logo-right {
            display: table-cell;
            vertical-align: middle;
        }
        
        .logo-left, .logo-right {
            width: 70px;
        }
        
        .logo-left img, .logo-right img {
            width: 65px;
            height: 65px;
            display: block;
        }
        
        .header-center {
            text-align: center;
            padding: 0 15px;
        }
        
        .title-main {
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 2px;
        }
        
        .title-sub {
            font-size: 8pt;
            font-style: italic;
        }
        
        /* Info Fields */
        .info-section {
            border: 3px solid #000;
            border-top: none;
            padding: 8px 12px;
        }
        
        .info-line {
            display: table;
            width: 100%;
            margin-bottom: 6px;
        }
        
        .info-line:last-child {
            margin-bottom: 0;
        }
        
        .info-item {
            display: table-cell;
            vertical-align: middle;
            padding-right: 8px;
        }
        
        .info-label {
            font-weight: bold;
            font-size: 8pt;
            white-space: nowrap;
            padding-right: 4px;
        }
        
        .info-box {
            border: 2px solid #000;
            padding: 4px 8px;
            display: inline-block;
            min-width: 100px;
            min-height: 20px;
            background: white;
        }
        
        .info-box.small { min-width: 95px; }
        .info-box.medium { min-width: 140px; }
        .info-box.large { min-width: 350px; }
        
        /* Main Table */
        .attendance-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            margin: 8px 0;
        }
        
        .attendance-table th,
        .attendance-table td {
            border: 1px solid #000;
            padding: 2px;
            text-align: center;
            vertical-align: middle;
            font-size: 7pt;
        }
        
        .attendance-table thead th {
            font-weight: bold;
            background: white;
            padding: 3px 2px;
        }
        
        .num-col {
            width: 22px;
            background: #f0f0f0;
            font-size: 7pt;
        }
        
        .name-col {
            width: 145px;
            text-align: left;
            padding-left: 4px;
            font-size: 7pt;
        }
        
        .name-header {
            width: 145px;
            font-size: 7.5pt;
            line-height: 1.2;
            padding: 4px;
        }
        
        .day-col {
            width: 13px;
            min-width: 13px;
            max-width: 13px;
            height: 22px;
            font-size: 7pt;
            position: relative;
            padding: 1px;
        }
        
        .day-col::before {
            content: "";
            position: absolute;
            top: 1px;
            left: 1px;
            right: 1px;
            bottom: 1px;
            background: 
                repeating-linear-gradient(
                    135deg,
                    transparent,
                    transparent 2px,
                    #ddd 2px,
                    #ddd 3px
                );
            pointer-events: none;
        }
        
        .day-col span {
            position: relative;
            z-index: 1;
        }
        
        .total-col {
            width: 32px;
            font-size: 7pt;
        }
        
        .remarks-col {
            width: 110px;
            font-size: 6.5pt;
            text-align: left;
            padding: 2px 3px;
        }
        
        .remarks-header {
            width: 110px;
            font-size: 6.5pt;
            line-height: 1.15;
        }
        
        .gender-row {
            background: #e0e0e0;
            font-weight: bold;
            font-size: 8pt;
        }
        
        .combined-row {
            background: #c8c8c8;
            font-weight: bold;
            font-size: 8pt;
        }
        
        .mark-present { color: transparent; }
        .mark-absent { color: #000; font-weight: bold; }
        .mark-tardy { color: #555; font-weight: bold; }
        
        /* Bottom Section */
        .bottom-section {
            display: table;
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px 0;
            margin-top: 8px;
        }
        
        .bottom-box {
            display: table-cell;
            border: 2px solid #000;
            padding: 6px 8px;
            vertical-align: top;
            font-size: 6.5pt;
            line-height: 1.25;
        }
        
        .bottom-box.guide { width: 42%; }
        .bottom-box.codes { width: 32%; }
        .bottom-box.summary { width: 26%; }
        
        .section-head {
            font-weight: bold;
            font-size: 7.5pt;
            margin-bottom: 4px;
        }
        
        ol {
            margin: 2px 0 4px 14px;
            padding: 0;
        }
        
        ol li {
            margin-bottom: 2px;
        }
        
        .math-formula {
            margin: 4px 0 4px 12px;
            font-size: 6.5pt;
        }
        
        .frac {
            text-align: center;
            margin: 2px 0;
        }
        
        .frac-top {
            border-bottom: 1px solid #000;
            padding-bottom: 1px;
            margin-bottom: 1px;
        }
        
        .codes-list {
            font-size: 6.5pt;
        }
        
        .codes-list p {
            margin: 2px 0;
        }
        
        .codes-list .subhead {
            font-weight: bold;
            margin-top: 4px;
            display: block;
        }
        
        /* Summary Table */
        .sum-table {
            width: 100%;
            border-collapse: collapse;
            margin: 5px 0 8px 0;
        }
        
        .sum-table th,
        .sum-table td {
            border: 1px solid #000;
            padding: 2px 3px;
            font-size: 6.5pt;
            text-align: center;
        }
        
        .sum-table th {
            background: #f0f0f0;
            font-weight: bold;
        }
        
        .sum-table td.left-align {
            text-align: left;
            padding-left: 4px;
        }
        
        .sig-area {
            margin-top: 6px;
            text-align: center;
            font-size: 6.5pt;
        }
        
        .sig-line {
            border-bottom: 1px solid #000;
            height: 16px;
            margin: 3px 0;
        }
        
        .page-num {
            margin-top: 8px;
            font-size: 8pt;
            font-weight: bold;
        }
        
        @media print {
            body {
                padding: 0;
                margin: 0;
            }
            
            .page {
                max-width: 100%;
            }
            
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            
            .header-box, .info-section, .attendance-table, .bottom-section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
<div class="page">
    <?php
        use Carbon\Carbon;

        // Month label like "October 2024"
        $monthLabel = isset($month, $year)
            ? Carbon::create($year, $month, 1)->format('F Y')
            : '';

        // Fixed days shown in the template header
        $shownDays = [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19,22,23,24,25,26,29,30];

        // Helper to map attendance status to symbol styling
        $renderMark = function ($status) {
            if ($status === 'absent') return '<span class="mark-absent">/</span>';
            if ($status === 'late' || $status === 'tardy') return '<span class="mark-tardy">T</span>';
            // present or null defaults to present mark (invisible dot to keep cell height)
            return '<span class="mark-present">.</span>';
        };

        // Build quick lookup: date->status per student
        $buildDayStatus = function ($student, $month, $year) {
            $map = [];
            if (!empty($student->attendances)) {
                foreach ($student->attendances as $att) {
                    if ($att->date instanceof Carbon) {
                        $d = (int) $att->date->day;
                    } else {
                        $d = (int) Carbon::parse($att->date)->day;
                    }
                    $map[$d] = $att->status;
                }
            }
            return $map;
        };

        $formatStudentName = function ($student) {
            // Expecting fields: last_name, first_name, middle_name or combined name
            if (isset($student->last_name) && isset($student->first_name)) {
                $mid = isset($student->middle_name) && $student->middle_name ? ' ' . strtoupper($student->middle_name) : '';
                return strtoupper($student->last_name).', '.strtoupper($student->first_name).$mid;
            }
            return strtoupper($student->name ?? '');
        };

        $countTotals = function ($student) {
            $p = $a = $t = 0;
            if (!empty($student->attendances)) {
                foreach ($student->attendances as $att) {
                    if ($att->status === 'present') $p++;
                    elseif ($att->status === 'absent') $a++;
                    elseif ($att->status === 'late' || $att->status === 'tardy') $t++;
                }
            }
            return [$p, $a, $t];
        };
    ?>
    <div class="header-box">
        <div class="header-row">
            <div class="logo-left">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/DepEd_seal.png" alt="DepEd">
            </div>
            <div class="header-center">
                <div class="title-main">School Form 2 (SF2) Daily Attendance Report of Learners</div>
                <div class="title-sub">(This replaces Form 1, Form 2 & STS Form 4 - Absenteeism and Dropout Profile)</div>
            </div>
            <div class="logo-right">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/DepEd_seal.png" alt="DepEd">
            </div>
        </div>
    </div>
    
    <div class="info-section">
        <div class="info-line">
            <div class="info-item">
                <span class="info-label">School ID</span>
                <div class="info-box small">{{ $schoolSettings['school_id'] ?? '' }}</div>
            </div>
            <div class="info-item">
                <span class="info-label">School Year</span>
                <div class="info-box small">{{ $year ?? '' }}</div>
            </div>
            <div class="info-item">
                <span class="info-label">Report for the Month of</span>
                <div class="info-box medium">{{ $monthLabel }}</div>
            </div>
        </div>
        <div class="info-line">
            <div class="info-item">
                <span class="info-label">Name of School</span>
                <div class="info-box large">{{ $schoolSettings['school_name'] ?? '' }}</div>
            </div>
            <div class="info-item">
                <span class="info-label">Grade Level</span>
                <div class="info-box small">{{ $gradeLevel->name ?? '' }}</div>
            </div>
            <div class="info-item">
                <span class="info-label">Section</span>
                <div class="info-box medium">{{ $section->name ?? '' }}</div>
            </div>
        </div>
    </div>
    
    <table class="attendance-table">
        <thead>
            <tr>
                <th rowspan="3" class="num-col"></th>
                <th rowspan="3" class="name-header">LEARNER'S NAME<br>(Last Name, First Name, Middle Name)</th>
                <th colspan="22" style="font-size: 7.5pt; padding: 3px;">(1st row for date, 2nd row for Day: M,T,W,TH,F)</th>
                <th colspan="3" style="font-size: 7.5pt; padding: 3px;">Total for the Month</th>
                <th rowspan="3" class="remarks-header">REMARKS (If DROPPED OUT, state reason, please refer to legend number 2. If TRANSFERRED IN/OUT, write the name of School.)</th>
            </tr>
            <tr>
                <th class="day-col">1</th><th class="day-col">2</th><th class="day-col">3</th><th class="day-col">4</th><th class="day-col">5</th>
                <th class="day-col">8</th><th class="day-col">9</th><th class="day-col">10</th><th class="day-col">11</th><th class="day-col">12</th>
                <th class="day-col">15</th><th class="day-col">16</th><th class="day-col">17</th><th class="day-col">18</th><th class="day-col">19</th>
                <th class="day-col">22</th><th class="day-col">23</th><th class="day-col">24</th><th class="day-col">25</th><th class="day-col">26</th>
                <th class="day-col">29</th><th class="day-col">30</th>
                <th rowspan="2" class="total-col">Present</th>
                <th rowspan="2" class="total-col">Absent</th>
                <th rowspan="2" class="total-col">Tardy</th>
            </tr>
            <tr>
                <th class="day-col">T</th><th class="day-col">W</th><th class="day-col">TH</th><th class="day-col">F</th><th class="day-col">M</th>
                <th class="day-col">T</th><th class="day-col">W</th><th class="day-col">TH</th><th class="day-col">F</th><th class="day-col">M</th>
                <th class="day-col">T</th><th class="day-col">W</th><th class="day-col">TH</th><th class="day-col">F</th><th class="day-col">M</th>
                <th class="day-col">T</th><th class="day-col">W</th><th class="day-col">TH</th><th class="day-col">F</th><th class="day-col">M</th>
                <th class="day-col">T</th><th class="day-col">W</th>
            </tr>
        </thead>
        <tbody>
            <?php $rowNumber = 1; ?>
            @foreach(($maleStudents ?? collect()) as $student)
                <?php
                    $dayStatus = $buildDayStatus($student, $month ?? null, $year ?? null);
                    [$pTotal, $aTotal, $tTotal] = $countTotals($student);
                ?>
                <tr>
                    <td class="num-col">{{ $rowNumber }}</td>
                    <td class="name-col">{{ $formatStudentName($student) }}</td>
                    @foreach($shownDays as $d)
                        <td class="day-col">{!! $renderMark($dayStatus[$d] ?? 'present') !!}</td>
                    @endforeach
                    <td class="total-col">{{ $pTotal }}</td>
                    <td class="total-col">{{ $aTotal }}</td>
                    <td class="total-col">{{ $tTotal }}</td>
                    <td class="remarks-col"></td>
                </tr>
                <?php $rowNumber++; ?>
            @endforeach

            <tr class="gender-row">
                <td class="num-col">{{ $rowNumber }}</td>
                <td colspan="25">⟵ MALE | TOTAL Per Day ⟶</td>
            </tr>
            <?php $rowNumber++; ?>

            @foreach(($femaleStudents ?? collect()) as $student)
                <?php
                    $dayStatus = $buildDayStatus($student, $month ?? null, $year ?? null);
                    [$pTotal, $aTotal, $tTotal] = $countTotals($student);
                ?>
                <tr>
                    <td class="num-col">{{ $rowNumber }}</td>
                    <td class="name-col">{{ $formatStudentName($student) }}</td>
                    @foreach($shownDays as $d)
                        <td class="day-col">{!! $renderMark($dayStatus[$d] ?? 'present') !!}</td>
                    @endforeach
                    <td class="total-col">{{ $pTotal }}</td>
                    <td class="total-col">{{ $aTotal }}</td>
                    <td class="total-col">{{ $tTotal }}</td>
                    <td class="remarks-col"></td>
                </tr>
                <?php $rowNumber++; ?>
            @endforeach

            <tr class="gender-row">
                <td class="num-col">{{ $rowNumber }}</td>
                <td colspan="25">⟵ FEMALE | TOTAL Per Day ⟶</td>
            </tr>
            <?php $rowNumber++; ?>

            <tr class="combined-row">
                <td class="num-col">{{ $rowNumber }}</td>
                <td colspan="25">⟵ Combined TOTAL PER DAY ⟶</td>
            </tr>
        </tbody>
    </table>
    
    <div class="bottom-section">
        <div class="bottom-box guide">
            <div class="section-head">GUIDELINES:</div>
            <ol>
                <li>The attendance shall be accomplished daily. Refer to the codes for checking learners' attendance.</li>
                <li>Dates shall be written in the preceding columns beside Learner's Name.</li>
                <li>To compute the following:</li>
            </ol>
            <div class="math-formula">
                <div><strong>a.</strong> <em>Percentage of Enrollment =</em></div>
                <div class="frac">
                    <div class="frac-top">Registered Learner as of End of the Month</div>
                    <div>Enrolment as of 1st Friday of June</div>
                </div>
                <div>× 100</div>
            </div>
            <div class="math-formula">
                <div><strong>b.</strong> <em>Average Daily Attendance =</em></div>
                <div class="frac">
                    <div class="frac-top">Total Daily Attendance</div>
                    <div>Number of School Days in reporting month</div>
                </div>
            </div>
            <div class="math-formula">
                <div><strong>c.</strong> <em>Percentage of Attendance for the month =</em></div>
                <div class="frac">
                    <div class="frac-top">Average daily attendance</div>
                    <div>Registered Learner as of End of the month</div>
                </div>
                <div>× 100</div>
            </div>
            <ol start="4">
                <li>Every End of the month, the class adviser will submit this form to the office of the principal for recording of summary table into the school register.</li>
                <li>Once signed by the principal, this form should be returned to the class adviser.</li>
                <li>The adviser will extend necessary intervention including but not limited to home visitation to learners that committed 5 consecutive days of absences or those with potentials of dropping out</li>
                <li>Attendance performance of learner is expected to be reflected in Form 137 and Form 138 every grading period</li>
            </ol>
            <p style="margin-top: 3px;"><strong>*</strong> Beginning of School Year cut-off report is every 1st Friday of School Calendar Days</p>
        </div>
        
        <div class="bottom-box codes">
            <div class="section-head">1. CODES FOR CHECKING ATTENDANCE</div>
            <div class="codes-list">
                <p><strong>blank-Present; (+)-Absent; Tardy (half shaded= Upper for Late Commer; Lower for Cutting Classes)</strong></p>
            </div>
            <div class="section-head" style="margin-top: 5px;">2. REASONS/CAUSES OF DROP-OUTS</div>
            <div class="codes-list">
                <span class="subhead">a. Domestic-Related Factors</span>
                <p>a.1. Had to take care of siblings<br>a.2. Early marriage/pregnancy<br>a.3. Parents' attitude toward schooling<br>a.4. Family problems</p>
                <span class="subhead">b. Individual-Related Factors</span>
                <p>b.1. Illness<br>b.2. Overage<br>b.3. Death<br>b.4. Drug Abuse<br>b.5. Poor academic performance<br>b.6. Lack of interest/Distractions<br>b.7. Hunger/Malnutrition</p>
                <span class="subhead">c. School-Related Factors</span>
                <p>c.1. Teacher Factor<br>c.2. Physical condition of classroom<br>c.3. Peer influence</p>
                <span class="subhead">d. Geographic/Environmental</span>
                <p>d.1. Distance between home and school<br>d.2. Armed conflict (incl. Tribal wars & clanfeuds)<br>d.3. Calamities/Disasters</p>
                <span class="subhead">e. Financial-Related</span>
                <p>e.1. Child labor, work</p>
                <span class="subhead">f. Others</span>
            </div>
        </div>
        
        <div class="bottom-box summary">
            <div class="section-head">Month: _________________</div>
            <table class="sum-table">
                <tr>
                    <th rowspan="2">Summary for the<br>Month</th>
                    <th colspan="3">No. of Days of<br>Classes</th>
                </tr>
                <tr>
                    <th>M</th>
                    <th>F</th>
                    <th>TOTAL</th>
                </tr>
                <tr>
                    <td class="left-align"><em>* Enrolment as of (1st Friday of June)</em></td>
                    <td>{{ $summary['male_count'] ?? '' }}</td>
                    <td>{{ $summary['female_count'] ?? '' }}</td>
                    <td>{{ $summary['total_students'] ?? '' }}</td>
                </tr>
                <tr>
                    <td class="left-align"><em>Late Enrolment during the month (beyond cut-off)</em></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td class="left-align"><strong>Registered Learner as of end of the month</strong></td>
                    <td>{{ $summary['male_count'] ?? '' }}</td>
                    <td>{{ $summary['female_count'] ?? '' }}</td>
                    <td>{{ $summary['total_students'] ?? '' }}</td>
                </tr>
                <tr>
                    <td class="left-align"><strong>Percentage of Enrolment as of end of the month</strong></td>
                    <td colspan="3">{{ $summary['percentage_enrolment'] ?? '' }}%</td>
                </tr>
                <tr>
                    <td class="left-align"><strong>Average Daily Attendance</strong></td>
                    <td colspan="3">{{ $summary['average_daily_attendance'] ?? '' }}</td>
                </tr>
                <tr>
                    <td class="left-align"><strong>Percentage of Attendance for the month</strong></td>
                    <td colspan="3">{{ $summary['percentage_attendance'] ?? '' }}%</td>
                </tr>
                <tr>
                    <td class="left-align"><strong>Number of students with 5 consecutive days of absences</strong></td>
                    <td colspan="3"></td>
                </tr>
                <tr style="border-top: 2px solid #000;">
                    <td class="left-align"><strong>Drop out</strong></td>
                    <td colspan="3"></td>
                </tr>
                <tr>
                    <td class="left-align"><strong>Transferred out</strong></td>
                    <td colspan="3"></td>
                </tr>
                <tr>
                    <td class="left-align"><strong>Transferred in</strong></td>
                    <td colspan="3"></td>
                </tr>
            </table>
            
            <div class="sig-area">
                <p><em>I certify that this is a true and correct report.</em></p>
                <div class="sig-line"></div>
                <p>(Signature of Teacher over Printed Name)</p>
                <p style="margin-top: 8px;"><strong>Attested by:</strong></p>
                <div class="sig-line"></div>
                <p>(Signature of School Head over Printed Name)</p>
            </div>
        </div>
    </div>
    
    <div class="page-num">School Form 2: Page 2 of _______</div>
</div>
</body>
</html>