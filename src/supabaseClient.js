import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fuoteeefuxvamangyifw.supabase.co';
const supabaseAnonKey = 'sb_publishable_E6X8upwuc9nH6Hzr6D6jpg_5qFzisBg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);