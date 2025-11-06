import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Edit, QrCode } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import QRCode from 'qrcode';

interface ProfileCardProps {
  userId: string;
  onEditClick?: () => void;
}

export const ProfileCard = ({ userId, onEditClick }: ProfileCardProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<string>('visitor');
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        generateQRCode(userId);
      }

      // Load role
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .limit(1);

      if (rolesData && rolesData.length > 0) {
        setRole(rolesData[0].role);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const generateQRCode = async (id: string) => {
    try {
      const profileUrl = `${window.location.origin}/profile/${id}`;
      const qr = await QRCode.toDataURL(profileUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCode(qr);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { variant: 'destructive' as const, label: '🔐 Admin' },
      teacher: { variant: 'default' as const, label: '👨‍🏫 Teacher' },
      student: { variant: 'secondary' as const, label: '🎓 Student' },
      visitor: { variant: 'outline' as const, label: '👁️ Visitor' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.visitor;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!profile) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="glass-strong w-80">
        <CardContent className="p-6 space-y-4">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <div className="relative">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={profile.full_name || 'User'}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-background border-2 border-primary">
                <Shield className="h-3 w-3 text-primary" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground">
                {profile.full_name || 'User'}
              </h3>
              <div className="mt-1">{getRoleBadge(role)}</div>
            </div>
          </div>

          {/* QR Code */}
          {qrCode && (
            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg">
              <img src={qrCode} alt="Profile QR Code" className="w-32 h-32" />
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <QrCode className="h-3 w-3" />
                Scan to view profile
              </p>
            </div>
          )}

          {/* Actions */}
          {onEditClick && (
            <Button
              onClick={onEditClick}
              variant="outline"
              size="sm"
              className="w-full rounded-full"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
