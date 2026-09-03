-- Veyrivo CRM Database Schema for Supabase (PostgreSQL)
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(200),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Reference tables
CREATE TABLE IF NOT EXISTS industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    domain VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(50),
    website TEXT,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'USA',
    company_size VARCHAR(20) CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'archived')),
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view companies" ON companies
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Users can create companies" ON companies
    FOR INSERT WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY "Users can update own companies" ON companies
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all companies" ON companies
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    mobile VARCHAR(50),
    title VARCHAR(100),
    is_decision_maker BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    consent_status VARCHAR(20) DEFAULT 'pending' CHECK (consent_status IN ('opted_in', 'opted_out', 'pending')),
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contacts" ON contacts
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Users can create contacts" ON contacts
    FOR INSERT WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY "Users can update own contacts" ON contacts
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all contacts" ON contacts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'nurture', 'lost')),
    temperature VARCHAR(20) DEFAULT 'unknown' CHECK (temperature IN ('hot', 'warm', 'cold', 'unknown')),
    score SMALLINT DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    industry_id UUID REFERENCES industries(id) ON DELETE SET NULL,
    estimated_value NUMERIC(12, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    timeline VARCHAR(20) DEFAULT 'exploring' CHECK (timeline IN ('urgent', 'one_month', 'three_months', 'exploring')),
    budget_range VARCHAR(20) DEFAULT 'unknown' CHECK (budget_range IN ('low', 'medium', 'high', 'unknown')),
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    ai_summary TEXT,
    ai_result JSONB,
    qualified_at TIMESTAMPTZ,
    last_contacted_at TIMESTAMPTZ,
    next_follow_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view leads" ON leads
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Users can create leads" ON leads
    FOR INSERT WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY "Users can update own leads" ON leads
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all leads" ON leads
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    value NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    stage VARCHAR(20) DEFAULT 'new' CHECK (stage IN ('new', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
    probability SMALLINT DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    expected_close_date DATE,
    source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view deals" ON deals
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Users can create deals" ON deals
    FOR INSERT WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY "Users can update own deals" ON deals
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all deals" ON deals
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('call', 'meeting', 'email', 'task', 'note')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'pending', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    related_to VARCHAR(20) CHECK (related_to IN ('lead', 'deal', 'company', 'contact', 'none')),
    related_id UUID,
    related_name VARCHAR(200),
    contact VARCHAR(200),
    company VARCHAR(200),
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    duration SMALLINT DEFAULT 0,
    notes TEXT,
    outcome VARCHAR(100),
    next_action VARCHAR(200),
    next_action_date DATE,
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities" ON activities
    FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Users can create activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

CREATE POLICY "Users can update own activities" ON activities
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all activities" ON activities
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- AI Results table
CREATE TABLE IF NOT EXISTS ai_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL, -- leadGeneration, leadQualification, leadSummary, nextAction, emailDraft
    provider VARCHAR(50) NOT NULL, -- openai, anthropic, google, local
    model VARCHAR(100) NOT NULL,
    input_data JSONB NOT NULL,
    output_data JSONB,
    tokens_used INTEGER DEFAULT 0,
    cost_usd NUMERIC(10, 6) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    error_message TEXT,
    related_type VARCHAR(20), -- lead, deal, company, contact
    related_id UUID,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

ALTER TABLE ai_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI results" ON ai_results
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create AI results" ON ai_results
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can view all AI results" ON ai_results
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry_id);
CREATE INDEX IF NOT EXISTS idx_companies_deleted ON companies(deleted_at);

CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_deleted ON contacts(deleted_at);

CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_contact ON leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_deleted ON leads(deleted_at);
CREATE INDEX IF NOT EXISTS idx_leads_next_followup ON leads(next_follow_up_at);

CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals(owner_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_lead ON deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_deleted ON deals(deleted_at);
CREATE INDEX IF NOT EXISTS idx_deals_close_date ON deals(expected_close_date);

CREATE INDEX IF NOT EXISTS idx_activities_owner ON activities(owner_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_related ON activities(related_to, related_id);
CREATE INDEX IF NOT EXISTS idx_activities_scheduled ON activities(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_activities_deleted ON activities(deleted_at);

CREATE INDEX IF NOT EXISTS idx_ai_results_type ON ai_results(type);
CREATE INDEX IF NOT EXISTS idx_ai_results_related ON ai_results(related_type, related_id);
CREATE INDEX IF NOT EXISTS idx_ai_results_created_by ON ai_results(created_by);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default reference data
INSERT INTO industries (name, slug) VALUES
('Technology & Software', 'technology-software'),
('Healthcare & Medical', 'healthcare-medical'),
('Financial Services', 'financial-services'),
('Marketing & Advertising', 'marketing-advertising'),
('Logistics & Transportation', 'logistics-transportation'),
('Real Estate & Construction', 'real-estate-construction'),
('Education & Training', 'education-training'),
('Retail & E-Commerce', 'retail-ecommerce'),
('Energy & Utilities', 'energy-utilities'),
('Creative & Design', 'creative-design'),
('Manufacturing', 'manufacturing'),
('Hospitality & Tourism', 'hospitality-tourism'),
('Legal & Professional Services', 'legal-professional-services'),
('Telecommunications', 'telecommunications'),
('Food & Beverage', 'food-beverage')
ON CONFLICT (name) DO NOTHING;

INSERT INTO sources (name, slug) VALUES
('Website', 'website'),
('Referral', 'referral'),
('Cold Email', 'cold-email'),
('LinkedIn', 'linkedin'),
('Google Search', 'google-search'),
('Facebook', 'facebook'),
('Trade Show', 'trade-show'),
('Partner', 'partner'),
('Existing Customer', 'existing-customer')
ON CONFLICT (name) DO NOTHING;

INSERT INTO services (name, description) VALUES
('Website Development', 'Custom website design and development'),
('CRM Development', 'Custom CRM system development'),
('Mobile App Development', 'iOS and Android app development'),
('SEO & Digital Marketing', 'Search engine optimization and digital marketing'),
('AI & Automation', 'AI integration and business process automation'),
('Cloud Migration', 'Cloud infrastructure migration and management')
ON CONFLICT (name) DO NOTHING;