-- Users
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
BEGIN
  CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255),
    email NVARCHAR(255) UNIQUE,
    role NVARCHAR(50) NOT NULL DEFAULT 'Student',
    password NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE()
  );
END
GO

-- Applications
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Applications' AND xtype='U')
BEGIN
  CREATE TABLE Applications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL FOREIGN KEY REFERENCES Users(id),
    company_name NVARCHAR(255),
    position NVARCHAR(255),
    start_date DATE,
    end_date DATE,
    status NVARCHAR(50) DEFAULT 'Pending',
    applied_on DATETIME DEFAULT GETDATE(),
    processed_by INT NULL,
    processed_on DATETIME NULL,
    remarks NVARCHAR(1000) NULL
  );
END
GO

-- Documents
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Documents' AND xtype='U')
BEGIN
  CREATE TABLE Documents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    application_id INT NOT NULL FOREIGN KEY REFERENCES Applications(id),
    blob_url NVARCHAR(2000),
    file_name NVARCHAR(500),
    doc_type NVARCHAR(100),
    uploaded_on DATETIME DEFAULT GETDATE()
  );
END
GO

-- Audit Logs
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AuditLogs' AND xtype='U')
BEGIN
  CREATE TABLE AuditLogs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NULL,
    action NVARCHAR(255),
    details NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
  );
END
GO

-- Notifications
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Notifications' AND xtype='U')
BEGIN
  CREATE TABLE Notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    title NVARCHAR(255),
    message NVARCHAR(1000),
    is_read BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE()
  );
END
GO
