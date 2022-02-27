# Generated by Django 3.1.6 on 2022-02-27 02:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_remove_post_host'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='uuid_id',
        ),
        migrations.AlterField(
            model_name='post',
            name='id',
            field=models.URLField(blank=True, editable=False, primary_key=True, serialize=False, unique=True),
        ),
    ]
