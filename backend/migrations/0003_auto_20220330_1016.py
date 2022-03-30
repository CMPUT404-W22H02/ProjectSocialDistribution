# Generated by Django 3.1.6 on 2022-03-30 16:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_auto_20220330_0958'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment',
            name='published',
            field=models.DateTimeField(default='2022-03-30T16:16:01+00:00', editable=False),
        ),
        migrations.RemoveField(
            model_name='inbox',
            name='comments',
        ),
        migrations.AddField(
            model_name='inbox',
            name='comments',
            field=models.ManyToManyField(to='backend.Comment'),
        ),
        migrations.RemoveField(
            model_name='inbox',
            name='follows',
        ),
        migrations.AddField(
            model_name='inbox',
            name='follows',
            field=models.ManyToManyField(to='backend.Follow'),
        ),
        migrations.RemoveField(
            model_name='inbox',
            name='likes',
        ),
        migrations.AddField(
            model_name='inbox',
            name='likes',
            field=models.ManyToManyField(to='backend.Like'),
        ),
        migrations.AlterField(
            model_name='post',
            name='published',
            field=models.DateTimeField(default='2022-03-30T16:16:01+00:00', editable=False),
        ),
    ]
