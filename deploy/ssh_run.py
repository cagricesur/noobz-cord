#!/usr/bin/env python3
"""Run a remote shell command over SSH (password auth). Usage: ssh_run.py 'command'"""
import sys
import paramiko

import os

HOST = os.environ.get("NOOBZ_SSH_HOST", "164.68.110.124")
USER = os.environ.get("NOOBZ_SSH_USER", "root")
PASSWORD = os.environ["NOOBZ_SSH_PASSWORD"]


def main() -> int:
    if len(sys.argv) > 1 and sys.argv[1] == "--upload-run":
        local_path = sys.argv[2]
        remote_path = sys.argv[3]
        with open(local_path, encoding="utf-8") as f:
            content = f.read()
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, username=USER, password=PASSWORD, timeout=30)
        sftp = client.open_sftp()
        with sftp.file(remote_path, "w") as rf:
            rf.write(content)
        sftp.chmod(remote_path, 0o755)
        sftp.close()
        stdin, stdout, stderr = client.exec_command(f"bash {remote_path}", get_pty=True)
        out = stdout.read().decode(errors="replace")
        err = stderr.read().decode(errors="replace")
        code = stdout.channel.recv_exit_status()
        client.close()
        if out:
            sys.stdout.buffer.write(out.encode("utf-8", errors="replace"))
        if err:
            sys.stderr.buffer.write(err.encode("utf-8", errors="replace"))
        return code

    cmd = sys.argv[1] if len(sys.argv) > 1 else "uname -a"
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    out = stdout.read().decode(errors="replace")
    err = stderr.read().decode(errors="replace")
    code = stdout.channel.recv_exit_status()
    client.close()
    if out:
        sys.stdout.buffer.write(out.encode("utf-8", errors="replace"))
        if not out.endswith("\n"):
            sys.stdout.buffer.write(b"\n")
    if err:
        sys.stderr.buffer.write(err.encode("utf-8", errors="replace"))
        if not err.endswith("\n"):
            sys.stderr.buffer.write(b"\n")
    return code


if __name__ == "__main__":
    raise SystemExit(main())
