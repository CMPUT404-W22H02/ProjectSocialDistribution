# Generated by Django 3.1.6 on 2022-03-01 10:40

import uuid

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_auto_20220301_0332'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='nodeuser',
            name='uuid_id',
        ),
        migrations.AlterField(
            model_name='like',
            name='uuid',
            field=models.UUIDField(default=uuid.UUID('62bc4d3e-7d48-4ef3-ad1f-493a167fad6e'), primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='nodeuser',
            name='host',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='nodeuser',
            name='id',
            field=models.URLField(max_length=255, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='nodeuser',
            name='url',
            field=models.URLField(),
        ),
    ]
