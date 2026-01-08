-- Tighten RLS policies to require admin role for writes

-- Products
DROP POLICY IF EXISTS "Anyone can insert products" ON public.products;
DROP POLICY IF EXISTS "Anyone can update products" ON public.products;
DROP POLICY IF EXISTS "Anyone can delete products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Categories
DROP POLICY IF EXISTS "Anyone can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can update categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can delete categories" ON public.categories;
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Banners
DROP POLICY IF EXISTS "Anyone can insert banners" ON public.banners;
DROP POLICY IF EXISTS "Anyone can update banners" ON public.banners;
DROP POLICY IF EXISTS "Anyone can delete banners" ON public.banners;
CREATE POLICY "Admins can insert banners" ON public.banners FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update banners" ON public.banners FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete banners" ON public.banners FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Page Blocks
DROP POLICY IF EXISTS "Anyone can insert page blocks" ON public.page_blocks;
DROP POLICY IF EXISTS "Anyone can update page blocks" ON public.page_blocks;
DROP POLICY IF EXISTS "Anyone can delete page blocks" ON public.page_blocks;
CREATE POLICY "Admins can insert page blocks" ON public.page_blocks FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update page blocks" ON public.page_blocks FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete page blocks" ON public.page_blocks FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Email Campaigns
DROP POLICY IF EXISTS "Anyone can view campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Anyone can insert campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Anyone can update campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Anyone can delete campaigns" ON public.email_campaigns;
CREATE POLICY "Admins can view campaigns" ON public.email_campaigns FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert campaigns" ON public.email_campaigns FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update campaigns" ON public.email_campaigns FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete campaigns" ON public.email_campaigns FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Visitor Logs
DROP POLICY IF EXISTS "Admins can view visitor logs" ON public.visitor_logs;
DROP POLICY IF EXISTS "Anyone can insert visitor logs" ON public.visitor_logs;
CREATE POLICY "Admins can view visitor logs" ON public.visitor_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert visitor logs" ON public.visitor_logs FOR INSERT WITH CHECK (true);

-- Landing Pages
DROP POLICY IF EXISTS "Acesso total a landing_pages" ON public.landing_pages;
CREATE POLICY "Landing pages are viewable by everyone" ON public.landing_pages FOR SELECT USING (true);
CREATE POLICY "Admins can insert landing pages" ON public.landing_pages FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update landing pages" ON public.landing_pages FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete landing pages" ON public.landing_pages FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Admin users and chat messages (lock down legacy tables)
DROP POLICY IF EXISTS "Acesso total a admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Acesso total a admin_chat_messages" ON public.admin_chat_messages;
CREATE POLICY "Admins can manage admin_users" ON public.admin_users FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage admin_chat_messages" ON public.admin_chat_messages FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
