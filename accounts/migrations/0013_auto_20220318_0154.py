# Generated by Django 3.1.6 on 2022-03-18 07:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0012_auto_20220318_0152'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment',
            name='published',
            field=models.DateTimeField(default='2022-03-18T07:54:15+00:00'),
        ),
        migrations.AlterField(
            model_name='post',
            name='published',
            field=models.DateTimeField(default='2022-03-18T07:54:15+00:00'),
        ),
    ]
