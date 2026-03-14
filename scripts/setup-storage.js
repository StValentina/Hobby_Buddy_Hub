#!/usr/bin/env node

/**
 * Supabase Storage Setup Script
 * Creates the "avatars" bucket for profile image uploads
 * 
 * Usage: node scripts/setup-storage.js <supabase-url> <service-role-key>
 */

import fetch from 'node-fetch';
import readline from 'readline';

const args = process.argv.slice(2);

async function setupStorage(supabaseUrl, serviceRoleKey) {
  try {
    console.log('\n🚀 Hobby Buddy Hub - Storage Setup\n');
    console.log('Setting up Supabase Storage buckets...\n');

    // Check if avatars bucket exists
    console.log('📦 Checking for "avatars" bucket...');
    
    const checkResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
    });

    if (!checkResponse.ok) {
      console.error('❌ Failed to check buckets:', checkResponse.status);
      const error = await checkResponse.text();
      console.error('Error:', error);
      process.exit(1);
    }

    const buckets = await checkResponse.json();
    const avatarsBucketExists = Array.isArray(buckets) && buckets.some(b => b.name === 'avatars');

    if (avatarsBucketExists) {
      console.log('✅ "avatars" bucket already exists\n');
      return true;
    }

    // Create avatars bucket
    console.log('Creating "avatars" bucket...');
    
    const createResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 'avatars',
        name: 'avatars',
        public: true,
        file_size_limit: 5242880,
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      }),
    });

    if (!createResponse.ok) {
      console.error('❌ Failed to create bucket:', createResponse.status);
      const error = await createResponse.text();
      console.error('Error:', error);
      process.exit(1);
    }

    const bucketData = await createResponse.json();
    console.log('✅ "avatars" bucket created successfully!\n');
    console.log('  Bucket ID:', bucketData.id);
    console.log('  Bucket name:', bucketData.name);
    console.log('  Public:', bucketData.public);
    
    return true;

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function promptForCredentials() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('🔐 Supabase Storage Setup\n');
    console.log('To create the avatars bucket, you need:');
    console.log('  1. Supabase URL (from Dashboard > Settings > API)');
    console.log('  2. Service Role Key (from Dashboard > Settings > API)\n');
    
    rl.question('Enter Supabase URL: ', (url) => {
      rl.question('Enter Service Role Key: ', (key) => {
        rl.close();
        resolve({ url, key });
      });
    });
  });
}

async function main() {
  let supabaseUrl = args[0];
  let serviceRoleKey = args[1];

  if (!supabaseUrl || !serviceRoleKey) {
    console.log('Usage: node scripts/setup-storage.js <supabase-url> <service-role-key>\n');
    const creds = await promptForCredentials();
    supabaseUrl = creds.url;
    serviceRoleKey = creds.key;
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  await setupStorage(supabaseUrl, serviceRoleKey);
  console.log('✅ Storage setup complete!\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
