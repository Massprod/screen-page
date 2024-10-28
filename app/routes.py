from flask import Blueprint, render_template

# Define the blueprint for your routes
main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('mainLogin.html')


@main.route('/users')
def users():
    return render_template('usersPage.html')


@main.route('/grid')
def grid():
    return render_template('gridPage.html')


@main.route('/lab')
def lab():
    return render_template('laboratoryPage.html')


@main.route('/history')
def history():
    return render_template('historyPage.html')

@main.route('/old/grid')
def rebuild():
    return render_template('gridPageOld.html')
