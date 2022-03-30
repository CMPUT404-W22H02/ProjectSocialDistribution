from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='NodeUser',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(max_length=20, unique=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_admin', models.BooleanField(default=False)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.Group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.Permission', verbose_name='user permissions')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Author',
            fields=[
                ('id', models.URLField(max_length=255, primary_key=True, serialize=False)),
                ('url', models.URLField(blank=True)),
                ('host', models.CharField(blank=True, max_length=255)),
                ('display_name', models.CharField(max_length=255)),
                ('github', models.URLField(blank=True)),
                ('profile_image', models.URLField(blank=True)),
                ('followers', models.ManyToManyField(to='backend.Author')),
                ('user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-id'],
            },
        ),
        migrations.CreateModel(
            name='Node',
            fields=[
                ('api_domain', models.URLField(primary_key=True, serialize=False)),
                ('api_prefix', models.CharField(blank=True, max_length=255, null=True)),
                ('username', models.CharField(max_length=255)),
                ('password', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.URLField(blank=True, primary_key=True, serialize=False)),
                ('title', models.CharField(blank=True, max_length=50)),
                ('source', models.URLField(blank=True)),
                ('origin', models.URLField(blank=True)),
                ('description', models.CharField(blank=True, max_length=50)),
                ('content_type', models.CharField(blank=True, max_length=255, null=True)),
                ('content', models.CharField(blank=True, max_length=5000, null=True)),
                ('categories', models.CharField(blank=True, max_length=255, null=True)),
                ('count', models.IntegerField(default=0)),
                ('comments', models.URLField(blank=True)),
                ('comments_src', models.URLField(blank=True, null=True)),
                ('published', models.DateTimeField(default='2022-03-29T19:41:18+00:00', editable=False)),
                ('visibility', models.CharField(choices=[('PUBLIC', 'PUBLIC'), ('FRIENDS', 'FRIENDS')], default='PUBLIC', max_length=255)),
                ('unlisted', models.BooleanField(default=False)),
                ('author', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='backend.author')),
            ],
            options={
                'ordering': ['-published'],
            },
        ),
        migrations.CreateModel(
            name='Like',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('object', models.URLField(blank=True)),
                ('author', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='backend.author')),
            ],
        ),
        migrations.CreateModel(
            name='Inbox',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('author', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='author_inbox', to='backend.author')),
                ('posts', models.ManyToManyField(related_name='inbox_posts', to='backend.Post')),
            ],
        ),
        migrations.CreateModel(
            name='Follow',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('actor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sender', to='backend.author')),
                ('object', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recipient', to='backend.author')),
            ],
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('comment', models.CharField(max_length=500)),
                ('published', models.DateTimeField(default='2022-03-29T19:41:18+00:00', editable=False)),
                ('id', models.URLField(blank=True, primary_key=True, serialize=False)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='backend.author')),
                ('post', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='backend.post')),
            ],
            options={
                'ordering': ['-published'],
            },
        ),
    ]
