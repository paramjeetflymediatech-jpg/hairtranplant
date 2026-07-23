import { NextRequest, NextResponse } from 'next/server';
import { User, ensureDbSynced } from '@/db/models';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { enforceTenantAccess } from '@/lib/tenant';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDbSynced();
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const clinicId = enforceTenantAccess(session);
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const whereClause: any = {
      clinicId,
      role: {
        [Op.ne]: 'PATIENT',
      },
    };

    if (!includeInactive) {
      whereClause.isActive = true;
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'role', 'avatar', 'phone', 'isActive', 'createdAt'],
      order: [['name', 'ASC']],
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbSynced();
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (session.role !== 'CLINIC_ADMIN' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Clinic Admins can add new doctors or staff members' }, { status: 403 });
    }

    const clinicId = enforceTenantAccess(session);
    if (!clinicId) {
      return NextResponse.json({ error: 'Clinic ID missing' }, { status: 400 });
    }

    const body = await req.json();
    const { name, email, password, role = 'DOCTOR', phone, avatar } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Full Name, Email, and Password are required' }, { status: 400 });
    }

    const formattedRole = role.trim().toUpperCase().replace(/\s+/g, '_');
    if (!formattedRole) {
      return NextResponse.json({ error: 'Valid role title is required' }, { status: 400 });
    }

    if (formattedRole === 'SUPER_ADMIN' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot assign Super Admin role' }, { status: 403 });
    }

    const formattedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ where: { email: formattedEmail, clinicId } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email address already exists in this clinic' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      clinicId,
      name,
      email: formattedEmail,
      password: hashedPassword,
      role: formattedRole,
      phone: phone || null,
      avatar: avatar || null,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatar: newUser.avatar,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create team member' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureDbSynced();
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (session.role !== 'CLINIC_ADMIN' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Clinic Admins can edit team members' }, { status: 403 });
    }

    const clinicId = enforceTenantAccess(session);
    const body = await req.json();
    const { userId, name, email, password, role, phone, avatar, isActive } = body;

    if (!userId || !name || !email) {
      return NextResponse.json({ error: 'User ID, Full Name, and Email are required' }, { status: 400 });
    }

    const user = await User.findOne({ where: { id: userId, clinicId } });
    if (!user) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
    }

    const formattedEmail = email.toLowerCase().trim();
    if (formattedEmail !== user.email) {
      const existingUser = await User.findOne({ where: { email: formattedEmail, clinicId } });
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json({ error: 'An account with this email address already exists in this clinic' }, { status: 400 });
      }
      user.email = formattedEmail;
    }

    if (role) {
      const formattedRole = role.trim().toUpperCase().replace(/\s+/g, '_');
      if (formattedRole === 'SUPER_ADMIN' && session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Cannot assign Super Admin role' }, { status: 403 });
      }
      user.role = formattedRole;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    if (password) {
      user.password = await hashPassword(password);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Team member updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update team member' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureDbSynced();
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (session.role !== 'CLINIC_ADMIN' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Clinic Admins can manage team members' }, { status: 403 });
    }

    const clinicId = enforceTenantAccess(session);
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (userId === session.userId) {
      return NextResponse.json({ error: 'You cannot remove your own admin account' }, { status: 400 });
    }

    const user = await User.findOne({ where: { id: userId, clinicId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.isActive = !user.isActive;
    await user.save();

    return NextResponse.json({
      success: true,
      message: `User status changed to ${user.isActive ? 'Active' : 'Inactive'}`,
      isActive: user.isActive,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update user status' }, { status: 500 });
  }
}
