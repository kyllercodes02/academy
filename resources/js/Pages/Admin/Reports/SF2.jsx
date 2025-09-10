import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import '@/../css/sf2.css';

function generateDays(year, monthIndex) {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, monthIndex, day);
        const dow = date.getDay();
        const dowLabel = ['SU', 'M', 'T', 'W', 'TH', 'F', 'SA'][dow];
        days.push({ day, dow, dowLabel });
    }
    return days;
}

export default function SF2({
    schoolId = '',
    schoolYear = '',
    reportMonthLabel = '',
    schoolName = '',
    gradeLevel = '',
    section = '',
    year = new Date().getFullYear(),
    monthIndex = new Date().getMonth(),
    maleLearners = [],
    femaleLearners = [],
}) {
    const days = generateDays(year, monthIndex);
    const monthLabel = reportMonthLabel || new Date(year, monthIndex, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const renderLearnerRow = (learner, index, genderLabel) => (
        <tr key={`${genderLabel}-${index}`}>
            <td className="sf2-cell sf2-center sf2-narrow">{index + 1}</td>
            <td className="sf2-cell sf2-name">
                <div className="sf2-name-wrap">
                    <span className="sf2-name-last">{learner.lastName || ''}</span>
                    <span className="sf2-name-first">{learner.firstName || ''}</span>
                    <span className="sf2-name-middle">{learner.middleName || ''}</span>
                </div>
            </td>
            {days.map((d) => (
                <td key={d.day} className={`sf2-cell sf2-center ${d.dow === 0 || d.dow === 6 ? 'sf2-weekend' : ''}`}>
                    {learner.attendance?.[d.day] || ''}
                </td>
            ))}
            <td className="sf2-cell sf2-center sf2-narrow">{learner.totalAbsent || ''}</td>
            <td className="sf2-cell sf2-center sf2-narrow">{learner.totalTardy || ''}</td>
            <td className="sf2-cell sf2-remarks">{learner.remarks || ''}</td>
        </tr>
    );

    const daysCount = days.length; // 28..31

    return (
        <AdminLayout>
            <Head title="SF2 - Daily Attendance Report of Learners" />
            <div className="sf2-container">
                <div className="sf2-header">
                    <div className="sf2-title">School Form 2 (SF2) Daily Attendance Report of Learners</div>
                    <table className="sf2-meta-table">
                        <tbody>
                            <tr>
                                <td className="sf2-meta-label">School ID:</td>
                                <td className="sf2-meta-value">{schoolId}</td>
                                <td className="sf2-meta-label">School Year:</td>
                                <td className="sf2-meta-value">{schoolYear}</td>
                                <td className="sf2-meta-label">Report for the Month:</td>
                                <td className="sf2-meta-value">{monthLabel}</td>
                            </tr>
                            <tr>
                                <td className="sf2-meta-label">Name of School:</td>
                                <td className="sf2-meta-value" colSpan={3}>{schoolName}</td>
                                <td className="sf2-meta-label">Grade Level:</td>
                                <td className="sf2-meta-value">{gradeLevel}</td>
                            </tr>
                            <tr>
                                <td className="sf2-meta-label">Section:</td>
                                <td className="sf2-meta-value" colSpan={5}>{section}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="sf2-table-wrapper">
                    <table className="sf2-table" aria-label="SF2 Attendance Table">
                        <thead>
                            <tr>
                                <th className="sf2-th sf2-narrow" rowSpan={2}>No.</th>
                                <th className="sf2-th sf2-name" rowSpan={2}>Learner’s Name (Last Name, First Name, Middle Name)</th>
                                <th className="sf2-th" colSpan={daysCount}>Attendance for the Month</th>
                                <th className="sf2-th" colSpan={2}>Total for the Month</th>
                                <th className="sf2-th" rowSpan={2}>Remarks<br/>(Dropped out / Transferred in-out)</th>
                            </tr>
                            <tr>
                                {days.map((d) => (
                                    <th key={`day-${d.day}`} className="sf2-th sf2-center sf2-day">
                                        <div className="sf2-day-wrapper">
                                            <div className="sf2-day-num">{d.day}</div>
                                            <div className="sf2-day-dow">{d.dowLabel}</div>
                                        </div>
                                    </th>
                                ))}
                                <th className="sf2-th sf2-narrow">Absent</th>
                                <th className="sf2-th sf2-narrow">Tardy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* MALE section */}
                            <tr>
                                <td className="sf2-section" colSpan={2 + daysCount + 3}>MALE</td>
                            </tr>
                            {maleLearners.map((l, i) => renderLearnerRow(l, i, 'male'))}

                            {/* FEMALE section */}
                            <tr>
                                <td className="sf2-section" colSpan={2 + daysCount + 3}>FEMALE</td>
                            </tr>
                            {femaleLearners.map((l, i) => renderLearnerRow(l, i, 'female'))}

                            {/* TOTAL PER DAY rows */}
                            <tr>
                                <td className="sf2-total-label" colSpan={2}>MALE TOTAL Per Day</td>
                                {days.map((d) => (
                                    <td key={`m-total-${d.day}`} className="sf2-cell sf2-center"></td>
                                ))}
                                <td className="sf2-cell"></td>
                                <td className="sf2-cell"></td>
                                <td className="sf2-cell"></td>
                            </tr>
                            <tr>
                                <td className="sf2-total-label" colSpan={2}>FEMALE TOTAL Per Day</td>
                                {days.map((d) => (
                                    <td key={`f-total-${d.day}`} className="sf2-cell sf2-center"></td>
                                ))}
                                <td className="sf2-cell"></td>
                                <td className="sf2-cell"></td>
                                <td className="sf2-cell"></td>
                            </tr>
                            <tr>
                                <td className="sf2-total-label sf2-strong" colSpan={2}>Combined TOTAL Per Day</td>
                                {days.map((d) => (
                                    <td key={`c-total-${d.day}`} className="sf2-cell sf2-center sf2-strong"></td>
                                ))}
                                <td className="sf2-cell sf2-strong"></td>
                                <td className="sf2-cell sf2-strong"></td>
                                <td className="sf2-cell sf2-strong"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="sf2-guidelines">
                    <div className="sf2-guidelines-title">GUIDELINES:</div>
                    <ol className="sf2-guidelines-list">
                        <li>Use this form to report daily attendance of learners. Mark each day with the appropriate code.</li>
                        <li>Count and record totals for Absent and Tardy per learner for the month.</li>
                        <li>Fill out MALE / FEMALE total per day and the combined totals at the bottom.</li>
                        <li>Indicate remarks such as Dropped out (DO), Transferred In (TI), Transferred Out (TO) with dates.</li>
                    </ol>
                    <div className="sf2-codes">
                        <div className="sf2-codes-title">CODES:</div>
                        <ul className="sf2-codes-list">
                            <li><span className="sf2-code">P</span> Present</li>
                            <li><span className="sf2-code">A</span> Absent</li>
                            <li><span className="sf2-code">L</span> Late/Tardy</li>
                            <li><span className="sf2-code">E</span> Excused</li>
                            <li><span className="sf2-code">TI</span> Transferred In</li>
                            <li><span className="sf2-code">TO</span> Transferred Out</li>
                            <li><span className="sf2-code">DO</span> Dropped Out</li>
                        </ul>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}


