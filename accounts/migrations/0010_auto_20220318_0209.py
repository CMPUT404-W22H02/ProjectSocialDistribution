# Generated by Django 3.1.6 on 2022-03-18 08:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0009_auto_20220304_1429'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment',
            name='published',
            field=models.DateTimeField(default='2022-03-18T08:09:31+00:00'),
        ),
        migrations.AlterField(
            model_name='post',
            name='published',
            field=models.DateTimeField(default='2022-03-18T08:09:31+00:00'),
        ),
    ]