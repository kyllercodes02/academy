@extends('layouts.app')

@section('content')
<div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6 text-gray-900">
                <h2 class="text-2xl font-semibold text-gray-800 mb-6">Create New User</h2>

                @if ($errors->any())
                    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                        <p class="font-bold">Please fix the following errors:</p>
                        <ul>
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form method="POST" action="{{ route('users.store') }}" class="space-y-6">
                    @csrf
                    
                    <div>
                        <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" name="name" id="name" value="{{ old('name') }}" required
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>

                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" id="email" value="{{ old('email') }}" required
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" id="password" required
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>

                    <div>
                        <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <input type="password" name="password_confirmation" id="password_confirmation" required
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                    </div>

                    <div>
                        <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
                        <select name="role" id="role" required onchange="toggleAdditionalFields()"
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                            <option value="">Select Role</option>
                            <option value="admin" {{ old('role') == 'admin' ? 'selected' : '' }}>Admin</option>
                            <option value="teacher" {{ old('role') == 'teacher' ? 'selected' : '' }}>Teacher</option>
                            <option value="guardian" {{ old('role') == 'guardian' ? 'selected' : '' }}>Guardian</option>
                        </select>
                    </div>

                    <!-- Teacher Sections -->
                    <div id="teacherFields" class="hidden space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Assigned Sections</label>
                            <div class="mt-2 space-y-2">
                                @foreach($sections as $section)
                                    <div class="flex items-center">
                                        <input type="checkbox" name="sections[]" value="{{ $section }}"
                                               class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                               {{ in_array($section, old('sections', [])) ? 'checked' : '' }}>
                                        <label class="ml-2 text-sm text-gray-700">{{ $section }}</label>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>

                    <!-- Guardian Fields -->
                    <div id="guardianFields" class="hidden space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700">Linked Students</label>
                            <div class="mt-2 space-y-2">
                                @foreach($students as $student)
                                    <div class="flex items-center">
                                        <input type="checkbox" name="students[]" value="{{ $student->id }}"
                                               class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                               {{ in_array($student->id, old('students', [])) ? 'checked' : '' }}>
                                        <label class="ml-2 text-sm text-gray-700">{{ $student->name }} ({{ $student->student_section }})</label>
                                    </div>
                                @endforeach
                            </div>
                        </div>

                        <div>
                            <label for="relationship" class="block text-sm font-medium text-gray-700">Relationship to Student</label>
                            <select name="relationship" id="relationship"
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                <option value="">Select Relationship</option>
                                <option value="parent" {{ old('relationship') == 'parent' ? 'selected' : '' }}>Parent</option>
                                <option value="guardian" {{ old('relationship') == 'guardian' ? 'selected' : '' }}>Legal Guardian</option>
                                <option value="other" {{ old('relationship') == 'other' ? 'selected' : '' }}>Other</option>
                            </select>
                        </div>

                        <div>
                            <label for="contact_number" class="block text-sm font-medium text-gray-700">Contact Number</label>
                            <input type="tel" name="contact_number" id="contact_number" value="{{ old('contact_number') }}"
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        </div>
                    </div>

                    <div class="flex items-center justify-end mt-6">
                        <button type="submit" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                            Create User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
function toggleAdditionalFields() {
    const role = document.getElementById('role').value;
    const teacherFields = document.getElementById('teacherFields');
    const guardianFields = document.getElementById('guardianFields');
    
    teacherFields.classList.add('hidden');
    guardianFields.classList.add('hidden');
    
    if (role === 'teacher') {
        teacherFields.classList.remove('hidden');
    } else if (role === 'guardian') {
        guardianFields.classList.remove('hidden');
    }
}

// Call on page load to handle initial state
document.addEventListener('DOMContentLoaded', toggleAdditionalFields);
</script>
@endpush
@endsection 