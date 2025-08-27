@extends('layouts.app')

@section('content')
<div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6 text-gray-900">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-semibold text-gray-800">Edit User</h2>
                    <a href="{{ route('users.index') }}" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200">
                        Back to Users
                    </a>
                </div>

                @if ($errors->any())
                    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                        <p class="font-bold">Please fix the following errors:</p>
                        <ul class="list-disc list-inside">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form method="POST" action="{{ route('users.update', $user) }}" class="space-y-6">
                    @csrf
                    @method('PUT')
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" name="name" id="name" value="{{ old('name', $user->name) }}" required
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        </div>

                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" id="email" value="{{ old('email', $user->email) }}" required
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        </div>

                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700">Password (leave blank to keep current)</label>
                            <input type="password" name="password" id="password"
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        </div>

                        <div>
                            <label for="password_confirmation" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input type="password" name="password_confirmation" id="password_confirmation"
                                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                        </div>

                        <div>
                            <label for="role" class="block text-sm font-medium text-gray-700">Role</label>
                            <select name="role" id="role" required onchange="toggleAdditionalFields()"
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                <option value="">Select Role</option>
                                <option value="admin" {{ old('role', $user->role) == 'admin' ? 'selected' : '' }}>Admin</option>
                                <option value="teacher" {{ old('role', $user->role) == 'teacher' ? 'selected' : '' }}>Teacher</option>
                                <option value="guardian" {{ old('role', $user->role) == 'guardian' ? 'selected' : '' }}>Guardian</option>
                            </select>
                        </div>
                    </div>

                    <!-- Teacher Sections -->
                    <div id="teacherFields" class="hidden space-y-6">
                        <div class="border-t pt-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Assigned Sections</h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                @foreach($sections as $section)
                                    <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <input type="checkbox" name="sections[]" value="{{ $section }}"
                                               class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                               {{ in_array($section, old('sections', $assignedSections)) ? 'checked' : '' }}>
                                        <label class="text-sm text-gray-700">{{ $section }}</label>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>

                    <!-- Guardian Fields -->
                    <div id="guardianFields" class="hidden space-y-6">
                        <div class="border-t pt-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Guardian Details</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label for="contact_number" class="block text-sm font-medium text-gray-700">Contact Number</label>
                                    <input type="tel" name="contact_number" id="contact_number" 
                                           value="{{ old('contact_number', optional($guardianDetails)->contact_number) }}"
                                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                </div>

                                <div>
                                    <label for="relationship" class="block text-sm font-medium text-gray-700">Relationship to Student</label>
                                    <select name="relationship" id="relationship"
                                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                        <option value="">Select Relationship</option>
                                        <option value="parent" {{ old('relationship', optional($guardianDetails)->relationship) == 'parent' ? 'selected' : '' }}>Parent</option>
                                        <option value="guardian" {{ old('relationship', optional($guardianDetails)->relationship) == 'guardian' ? 'selected' : '' }}>Legal Guardian</option>
                                        <option value="other" {{ old('relationship', optional($guardianDetails)->relationship) == 'other' ? 'selected' : '' }}>Other</option>
                                    </select>
                                </div>

                                <div class="md:col-span-2">
                                    <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
                                    <textarea name="address" id="address" rows="3"
                                              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">{{ old('address', optional($guardianDetails)->address) }}</textarea>
                                </div>

                                <div>
                                    <label for="emergency_contact_name" class="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                                    <input type="text" name="emergency_contact_name" id="emergency_contact_name" 
                                           value="{{ old('emergency_contact_name', optional($guardianDetails)->emergency_contact_name) }}"
                                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                </div>

                                <div>
                                    <label for="emergency_contact_number" class="block text-sm font-medium text-gray-700">Emergency Contact Number</label>
                                    <input type="tel" name="emergency_contact_number" id="emergency_contact_number" 
                                           value="{{ old('emergency_contact_number', optional($guardianDetails)->emergency_contact_number) }}"
                                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                                </div>
                            </div>
                        </div>

                        <div class="border-t pt-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Linked Students</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                @foreach($students as $student)
                                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div class="flex items-center space-x-3">
                                            <input type="checkbox" name="students[]" value="{{ $student->id }}"
                                                   class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                   {{ in_array($student->id, old('students', $linkedStudents)) ? 'checked' : '' }}>
                                            <div>
                                                <label class="text-sm font-medium text-gray-700">{{ $student->name }}</label>
                                                <p class="text-sm text-gray-500">{{ $student->student_section }}</p>
                                            </div>
                                        </div>
                                        <div class="flex items-center space-x-4">
                                            <label class="flex items-center space-x-2">
                                                <input type="checkbox" name="primary_guardian[{{ $student->id }}]" value="1"
                                                       class="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                                                       {{ in_array($student->id, old('primary_guardian', $primaryStudents ?? [])) ? 'checked' : '' }}>
                                                <span class="text-sm text-gray-600">Primary</span>
                                            </label>
                                            <label class="flex items-center space-x-2">
                                                <input type="checkbox" name="can_pickup[{{ $student->id }}]" value="1"
                                                       class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                       {{ in_array($student->id, old('can_pickup', $canPickupStudents ?? [])) ? 'checked' : '' }}>
                                                <span class="text-sm text-gray-600">Can Pickup</span>
                                            </label>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-end pt-6 border-t border-gray-200">
                        <button type="submit" class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                            Update User
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