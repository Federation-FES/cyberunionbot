export type Json =
 | string
 | number
 | boolean
 | null
 | { [key: string]: Json | undefined }
 | Json[]

export type Database = {
 // Allows to automatically instantiate createClient with right options
 // instead of createClient (URL, KEY)
 __InternalSupabase: {
 PostgrestVersion: "14.1"
 }
 public: {
 Tables: {
 activation_codes: {
 Row: {
 code: string
 created_at: string
 duration_minutes: number
 expires_at: string
 id: string
 payment_id: string
 used_at: string | null
 }
 Insert: {
 code: string
 created_at?: string
 duration_minutes: number
 expires_at: string
 id?: string
 payment_id: string
 used_at?: string | null
 }
 Update: {
 code?: string
 created_at?: string
 duration_minutes?: number
 expires_at?: string
 id?: string
 payment_id?: string
 used_at?: string | null
 }
 Relationships: [
 {
 foreignKeyName: "activation_codes_payment_id_fkey"
 columns: ["payment_id"]
 isOneToOne: false
 referencedRelation: "payments"
 referencedColumns: ["id"]
 },
 ]
 }
 computers: {
 Row: {
 created_at: string
 description: string | null
 id: string
 ip_address: string | null
 location: string | null
 name: string
 status: Database["public"]["Enums"]["computer_status"]
 updated_at: string
 }
 Insert: {
 created_at?: string
 description?: string | null
 id?: string
 ip_address?: string | null
 location?: string | null
 name: string
 status?: Database["public"]["Enums"]["computer_status"]
 updated_at?: string
 }
 Update: {
 created_at?: string
 description?: string | null
 id?: string
 ip_address?: string | null
 location?: string | null
 name?: string
 status?: Database["public"]["Enums"]["computer_status"]
 updated_at?: string
 }
 Relationships: []
 }
 payments: {
 Row: {
 amount: number
 confirmation_url: string | null
 created_at: string
 custom_hours: number | null
 external_payment_id: string | null
 id: string
 payment_method: string | null
 status: Database["public"]["Enums"]["payment_status"]
 tariff_id: string | null
 telegram_user_id: string
 updated_at: string
 }
 Insert: {
 amount: number
 confirmation_url?: string | null
 created_at?: string
 custom_hours?: number | null
 external_payment_id?: string | null
 id?: string
 payment_method?: string | null
 status?: Database["public"]["Enums"]["payment_status"]
 tariff_id?: string | null
 telegram_user_id: string
 updated_at?: string
 }
 Update: {
 amount?: number
 confirmation_url?: string | null
 created_at?: string
 custom_hours?: number | null
 external_payment_id?: string | null
 id?: string
 payment_method?: string | null
 status?: Database["public"]["Enums"]["payment_status"]
 tariff_id?: string | null
 telegram_user_id?: string
 updated_at?: string
 }
 Relationships: [
 {
 foreignKeyName: "payments_tariff_id_fkey"
 columns: ["tariff_id"]
 isOneToOne: false
 referencedRelation: "tariffs"
 referencedColumns: ["id"]
 },
 ]
 }
 sessions: {
 Row: {
 activation_code_id: string
 computer_id: string
 created_at: string
 duration_minutes: number
 end_time: string | null
 id: string
 start_time: string
 }
 Insert: {
 activation_code_id: string
 computer_id: string
 created_at?: string
 duration_minutes: number
 end_time?: string | null
 id?: string
 start_time?: string
 }
 Update: {
 activation_code_id?: string
 computer_id?: string
 created_at?: string
 duration_minutes?: number
 end_time?: string | null
 id?: string
 start_time?: string
 }
 Relationships: [
 {
 foreignKeyName: "sessions_activation_code_id_fkey"
 columns: ["activation_code_id"]
 isOneToOne: false
 referencedRelation: "activation_codes"
 referencedColumns: ["id"]
 },
 {
 foreignKeyName: "sessions_computer_id_fkey"
 columns: ["computer_id"]
 isOneToOne: false
 referencedRelation: "computers"
 referencedColumns: ["id"]
 },
 ]
 }
 tariffs: {
 Row: {
 created_at: string
 description: string | null
 duration_minutes: number
 hourly_rate: number | null
 id: string
 is_active: boolean
 name: string
 price: number
 type: Database["public"]["Enums"]["tariff_type"]
 updated_at: string
 }
 Insert: {
 created_at?: string
 description?: string | null
 duration_minutes: number
 hourly_rate?: number | null
 id?: string
 is_active?: boolean
 name: string
 price: number
 type?: Database["public"]["Enums"]["tariff_type"]
 updated_at?: string
 }
 Update: {
 created_at?: string
 description?: string | null
 duration_minutes?: number
 hourly_rate?: number | null
 id?: string
 is_active?: boolean
 name?: string
 price?: number
 type?: Database["public"]["Enums"]["tariff_type"]
 updated_at?: string
 }
 Relationships: []
 }
 user_roles: {
 Row: {
 created_at: string
 id: string
 role: Database["public"]["Enums"]["app_role"]
 user_id: string
 }
 Insert: {
 created_at?: string
 id?: string
 role: Database["public"]["Enums"]["app_role"]
 user_id: string
 }
 Update: {
 created_at?: string
 id?: string
 role?: Database["public"]["Enums"]["app_role"]
 user_id?: string
 }
 Relationships: []
 }
 }
 Views: {
 [_ in never]: never
 }
 Functions: {
 generate_activation_code: { Args: never; Returns: string }
 has_role: {
 Args: {
 _role: Database["public"]["Enums"]["app_role"]
 _user_id: string
 }
 Returns: boolean
 }
 is_admin: { Args: never; Returns: boolean }
 is_service_account: { Args: never; Returns: boolean }
 }
 Enums: {
 app_role: "admin" | "service_account"
 computer_status: "available" | "occupied" | "maintenance"
 payment_status: "pending" | "succeeded" | "failed" | "cancelled"
 tariff_type: "hourly" | "package"
 }
 CompositeTypes: {
 [_ in never]: never
 }
 }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">];

export type Tables<
 DefaultSchemaTableNameOrOptions extends
 | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
 | { schema: keyof DatabaseWithoutInternals },
 TableName extends DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
 DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
 : never = never,
> = DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
 DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
 Row: infer R
 }
 ? R
 : never
 : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
 DefaultSchema["Views"])
 ? (DefaultSchema["Tables"] &
 DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
 Row: infer R
 }
 ? R
 : never
 : never

export type TablesInsert<
 DefaultSchemaTableNameOrOptions extends
 | keyof DefaultSchema["Tables"]
 | { schema: keyof DatabaseWithoutInternals },
 TableName extends DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
 : never = never,
> = DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
 Insert: infer I
 }
 ? I
 : never
 : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
 ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
 Insert: infer I
 }
 ? I
 : never
 : never

export type TablesUpdate<
 DefaultSchemaTableNameOrOptions extends
 | keyof DefaultSchema["Tables"]
 | { schema: keyof DatabaseWithoutInternals },
 TableName extends DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
 : never = never,
> = DefaultSchemaTableNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
 Update: infer U
 }
 ? U
 : never
 : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
 ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
 Update: infer U
 }
 ? U
 : never
 : never

export type Enums<
 DefaultSchemaEnumNameOrOptions extends
 | keyof DefaultSchema["Enums"]
 | { schema: keyof DatabaseWithoutInternals },
 EnumName extends DefaultSchemaEnumNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
 : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
 : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
 ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
 : never

export type CompositeTypes<
 PublicCompositeTypeNameOrOptions extends
 | keyof DefaultSchema["CompositeTypes"]
 | { schema: keyof DatabaseWithoutInternals },
 CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
 }
 ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
 : never = never,
> = PublicCompositeTypeNameOrOptions extends {
 schema: keyof DatabaseWithoutInternals
}
 ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
 : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
 ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
 : never

export const Constants = {
 public: {
 Enums: {
 app_role: ["admin", "service_account"],
 computer_status: ["available", "occupied", "maintenance"],
 payment_status: ["pending", "succeeded", "failed", "cancelled"],
 tariff_type: ["hourly", "package"],
 },
 },
} as const
