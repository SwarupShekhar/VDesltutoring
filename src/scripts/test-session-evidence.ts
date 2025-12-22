/**
 * Test script to verify session evidence functionality
 * This script tests the new session evidence fields
 */

import { prisma } from '../lib/prisma'

async function testSessionEvidence() {
  try {
    // Create a test session with evidence fields
    console.log('Creating test session with evidence fields...')
    
    // Using bracket notation to work around TypeScript caching issues
    const testSessionData: any = {
      student_id: 'test-student-id',
      tutor_id: 'test-tutor-id',
      start_time: new Date(),
      end_time: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      status: 'SCHEDULED',
      tutor_join_time: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes after start
      student_join_time: new Date(Date.now() + 6 * 60 * 1000), // 6 minutes after start
      tutor_leave_time: new Date(Date.now() + 55 * 60 * 1000), // 55 minutes after start
      student_leave_time: new Date(Date.now() + 56 * 60 * 1000), // 56 minutes after start
      completion_notes: 'Test session completed successfully',
    }
    
    const testSession: any = await prisma.sessions.create({
      data: testSessionData
    })
    
    console.log('Test session created with ID:', testSession.id)
    
    // Fetch the session with evidence fields to verify they were saved
    const fetchedSession: any = await prisma.sessions.findUnique({
      where: { id: testSession.id }
    })
    
    console.log('Test session fetched:', {
      id: fetchedSession.id,
      tutorJoinTime: fetchedSession['tutor_join_time']?.toISOString(),
      studentJoinTime: fetchedSession['student_join_time']?.toISOString(),
      tutorLeaveTime: fetchedSession['tutor_leave_time']?.toISOString(),
      studentLeaveTime: fetchedSession['student_leave_time']?.toISOString(),
      completionNotes: fetchedSession['completion_notes'],
    })
    
    // Update the session evidence
    console.log('Updating session evidence...')
    
    const updateData: any = {
      tutor_join_time: new Date(Date.now() + 4 * 60 * 1000), // 4 minutes after start
      completion_notes: 'Updated: Test session completed successfully with notes',
    }
    
    const updatedSession: any = await prisma.sessions.update({
      where: { id: testSession.id },
      data: updateData
    })
    
    console.log('Session evidence updated with ID:', updatedSession.id)
    
    // Fetch the updated session to verify the changes
    const fetchedUpdatedSession: any = await prisma.sessions.findUnique({
      where: { id: testSession.id }
    })
    
    console.log('Updated session fetched:', {
      id: fetchedUpdatedSession.id,
      tutorJoinTime: fetchedUpdatedSession['tutor_join_time']?.toISOString(),
      studentJoinTime: fetchedUpdatedSession['student_join_time']?.toISOString(),
      tutorLeaveTime: fetchedUpdatedSession['tutor_leave_time']?.toISOString(),
      studentLeaveTime: fetchedUpdatedSession['student_leave_time']?.toISOString(),
      completionNotes: fetchedUpdatedSession['completion_notes'],
    })
    
    // Clean up - delete the test session
    console.log('Cleaning up test session...')
    await prisma.sessions.delete({
      where: { id: testSession.id }
    })
    
    console.log('Test completed successfully!')
    
  } catch (error) {
    console.error('Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testSessionEvidence()